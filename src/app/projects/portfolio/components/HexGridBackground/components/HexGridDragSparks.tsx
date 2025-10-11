'use client';

import { useRasterizedSvgImage } from '@portfolio/hooks/hexgrid/useRasterizedSvgImage';
import { useLatestRef } from '@portfolio/hooks/useLatestRef';
import { clamp } from '@portfolio/utils/math';
import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export type HexGridDragSparksProps = {
  /** Stacking order for the absolute wrapper <div>. */
  zIndex: number;

  /** SVG path “d” of the hex grid stroke sized to `width`×`height` CSS units. */
  d: string;

  /** Logical width in CSS px (pre-DPR) of the drawing area. */
  width: number;

  /** Logical height in CSS px (pre-DPR) of the drawing area. */
  height: number;

  /** CSS color used for spark dots/trails on the main canvas. */
  color: string;

  /** Number of particles emitted per edge hit during a drag. */
  sparkCount: number;

  /**
   * Scales the measured drag speed (CSS px/s) before clamping to [minSpeed, maxSpeed].
   * Effective particle speed = clamp(v * speedScale, minSpeed, maxSpeed), with gaussian jitter.
   */
  speedScale: number;

  /** Minimum particle speed (CSS px/s) after scaling. */
  minSpeed: number;

  /** Maximum particle speed (CSS px/s) after scaling. */
  maxSpeed: number;

  /** Relative stddev applied to speed (e.g. 0.2 = ±20% sigma, gaussian). */
  speedSigmaPct: number;

  /** Mean particle lifetime in seconds. */
  lifeSec: number;

  /** Relative stddev applied to lifetime (e.g. 0.3 = ±30% sigma, gaussian). */
  lifeSigmaPct: number;

  /** Drag distance (CSS px) before the gesture is considered a “drag”. */
  dragThresholdPx: number;

  /**
   * Cell size (CSS px) for the spatial grid used to index edges.
   * Bigger cells = fewer buckets but more candidates.
   */
  cellSize: number;

  /**
   * Minimum emission angle (deg) relative to the inverse drag direction.
   * The spark heading is sampled uniformly in [angleMinDeg, angleMaxDeg] around −dragDir.
   */
  angleMinDeg: number;

  /** Maximum emission angle (deg) relative to the inverse drag direction. */
  angleMaxDeg: number;

  /** If true, disables page scrolling while dragging inside the host rect (touch only). */
  lockScrollOnTouch: boolean;

  /** Grid stroke width (CSS px) used when rasterizing the SVG path. */
  stroke: number;

  /** Grid stroke color used when rasterizing the SVG path. */
  gridColor: string;

  /**
   * Reveal half-length baseline (CSS px) for the mask stroke drawn per particle.
   * The actual length varies mildly with particle age.
   */
  revealRadiusPx: number;

  /**
   * Reveal feather (CSS px) used as line width baseline for the mask stroke.
   * The actual width varies mildly with particle age.
   */
  revealFeatherPx: number;

  /**
   * Per-second decay rate for the mask alpha. 0 disables decay (mask is cleared when empty).
   * Effective decay factor per frame = 1 − exp(−revealDecayPerSec * dtSec).
   */
  revealDecayPerSec: number;

  /**
   * Mean spark radius (CSS px). The rendered radius per particle is gaussian-jittered
   * using `sparkRadiusSigmaPct` and slightly modulated by particle age.
   */
  sparkRadiusPx: number;

  /** Relative stddev for spark radius (e.g. 0.25 = ±25% sigma, gaussian). */
  sparkRadiusSigmaPct: number;

  /** Optional wrapper className (wrapper is absolute, pointer-events: none). */
  className?: string;
};

type Edge = { ax: number; ay: number; bx: number; by: number; id: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  radius: number;
};

export default function HexGridDragSparks({
  zIndex,
  d,
  width,
  height,
  color,
  sparkCount,
  speedScale,
  minSpeed,
  maxSpeed,
  speedSigmaPct,
  lifeSec,
  lifeSigmaPct,
  dragThresholdPx,
  cellSize,
  angleMinDeg,
  angleMaxDeg,
  lockScrollOnTouch,
  stroke,
  gridColor,
  revealRadiusPx,
  revealFeatherPx,
  revealDecayPerSec,
  sparkRadiusPx,
  sparkRadiusSigmaPct,
  className,
}: HexGridDragSparksProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const dragging = useRef(false);
  const downPt = useRef<{ x: number; y: number } | null>(null);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const lastMoveTs = useRef<number | null>(null);
  const activeTouchId = useRef<number | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const lastTsRef = useRef<number | null>(null);
  const recentHitsRef = useRef<Array<{ x: number; y: number; t: number }>>([]);

  const MAX_DPR = 2;
  const rawDpr =
    typeof window !== 'undefined'
      ? Math.max(1, Math.floor(window.devicePixelRatio || 1))
      : 1;
  const dpr = Math.min(MAX_DPR, rawDpr);
  const MASK_SCALE = 0.5;

  const { image, status } = useRasterizedSvgImage({
    d,
    width,
    height,
    color: gridColor,
    stroke,
  });

  const isInsideHost = useCallback((x: number, y: number) => {
    const host = hostRef.current;
    if (!host) return false;
    const r = host.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }, []);

  const edges = useMemo<Edge[]>(() => {
    if (!d) return [];
    const snapQ = 0.25;
    const snap = (x: number) => Math.round(x / snapQ) * snapQ;
    const seen = new Set<string>();
    const out: Edge[] = [];
    let idx = 0;
    let id = 0;
    while (idx < d.length) {
      const m = d.indexOf('M', idx);
      if (m === -1) break;
      const z = d.indexOf('Z', m + 1);
      if (z === -1) break;
      const seg = d.slice(m, z);
      const nums = Array.from(seg.matchAll(/-?\d+(?:\.\d+)?/g)).map((n) =>
        parseFloat(n[0])
      );
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2)
        pts.push({ x: snap(nums[i]), y: snap(nums[i + 1]) });
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const kA = `${a.x.toFixed(2)},${a.y.toFixed(2)}`;
        const kB = `${b.x.toFixed(2)},${b.y.toFixed(2)}`;
        const key = kA < kB ? `${kA}|${kB}` : `${kB}|${kA}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, id: id++ });
      }
      idx = z + 1;
    }
    return out;
  }, [d]);

  const index = useMemo(() => {
    const s = Math.max(8, cellSize);
    const cell: Record<string, number[]> = {};
    for (const e of edges) {
      const minx = Math.min(e.ax, e.bx);
      const maxx = Math.max(e.ax, e.bx);
      const miny = Math.min(e.ay, e.by);
      const maxy = Math.max(e.ay, e.by);
      const ix0 = Math.floor(minx / s);
      const ix1 = Math.floor(maxx / s);
      const iy0 = Math.floor(miny / s);
      const iy1 = Math.floor(maxy / s);
      for (let ix = ix0; ix <= ix1; ix++) {
        for (let iy = iy0; iy <= iy1; iy++) {
          const key = `${ix},${iy}`;
          if (!cell[key]) cell[key] = [];
          cell[key].push(e.id);
        }
      }
    }
    return { cell, size: s };
  }, [edges, cellSize]);

  const segHit = useCallback(
    (
      ax: number,
      ay: number,
      bx: number,
      by: number,
      cx: number,
      cy: number,
      dx: number,
      dy: number
    ) => {
      const rpx = bx - ax;
      const rpy = by - ay;
      const spx = dx - cx;
      const spy = dy - cy;
      const den = rpx * spy - rpy * spx;
      if (Math.abs(den) < 1e-6) return null;
      const t = ((cx - ax) * spy - (cy - ay) * spx) / den;
      const u = ((cx - ax) * rpy - (cy - ay) * rpx) / den;
      if (t < 0 || t > 1 || u < 0 || u > 1) return null;
      return { x: ax + t * rpx, y: ay + t * rpy };
    },
    []
  );

  const latestDimsRef = useLatestRef({ width, height, dpr });
  const latestIndexRef = useLatestRef(index);
  const latestSegHitRef = useLatestRef(segHit);

  const configRef = useLatestRef({
    color,
    sparkCount,
    speedScale,
    minSpeed,
    maxSpeed,
    speedSigmaPct,
    lifeSec,
    lifeSigmaPct,
    dragThresholdPx,
    angleMinDeg,
    angleMaxDeg,
    revealRadiusPx,
    revealFeatherPx,
    revealDecayPerSec,
    sparkRadiusPx,
    sparkRadiusSigmaPct,
  });

  const randn = useCallback(() => {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }, []);

  const emit = useCallback(
    (x: number, y: number, ux: number, uy: number, baseSpeed: number) => {
      const cfg = configRef.current;
      let a0 = cfg.angleMinDeg;
      let a1 = cfg.angleMaxDeg;
      if (a1 < a0) [a0, a1] = [a1, a0];

      const tRaw = clamp(
        (baseSpeed - cfg.minSpeed) / Math.max(1, cfg.maxSpeed - cfg.minSpeed),
        0,
        1
      );
      const t = Math.pow(tRaw, 0.5);
      const count = Math.max(1, Math.round(cfg.sparkCount * (0.3 + 0.7 * t)));

      for (let i = 0; i < count; i++) {
        const baseX = -ux;
        const baseY = -uy;
        const bl = Math.hypot(baseX, baseY) || 1;
        const bx = baseX / bl;
        const by = baseY / bl;

        const ang = ((a0 + Math.random() * (a1 - a0)) * Math.PI) / 180;
        const cos = Math.cos(ang);
        const sin = Math.sin(ang);
        const rx = bx * cos - by * sin;
        const ry = bx * sin + by * cos;

        const s = Math.max(30, baseSpeed * (1 + cfg.speedSigmaPct * randn()));
        const life = Math.max(
          0.12,
          cfg.lifeSec * Math.max(0.2, 1 + cfg.lifeSigmaPct * randn())
        );

        const rMean = Math.max(0.5, cfg.sparkRadiusPx);
        const rVar = Math.max(0, cfg.sparkRadiusSigmaPct);
        const pr = Math.max(0.5, rMean * Math.max(0.25, 1 + rVar * randn()));

        const vx = rx * s;
        const vy = ry * s;

        particlesRef.current.push({
          x,
          y,
          vx,
          vy,
          born: performance.now(),
          life,
          radius: pr,
        });
      }

      const hits = recentHitsRef.current;
      hits.push({ x, y, t: performance.now() });
      while (hits.length > 64) hits.shift();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [randn]
  );

  const tooRecentHit = useCallback((x: number, y: number) => {
    const epsD = 10;
    const epsT = 110;
    const t = performance.now();
    for (let i = recentHitsRef.current.length - 1; i >= 0; i--) {
      const h = recentHitsRef.current[i];
      if (t - h.t > epsT) break;
      const dx = h.x - x;
      const dy = h.y - y;
      if (dx * dx + dy * dy < epsD * epsD) return true;
    }
    return false;
  }, []);

  const onDragMove = useCallback(
    (
      prev: { x: number; y: number },
      curr: { x: number; y: number },
      dtSec: number
    ) => {
      const cfg = configRef.current;
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const L = Math.hypot(dx, dy) || 1;
      if (L < 0.5) return;

      const ux = dx / L;
      const uy = dy / L;
      const v = dtSec > 0 ? L / dtSec : 0;

      const base = Math.max(
        cfg.minSpeed,
        Math.min(cfg.maxSpeed, v * cfg.speedScale)
      );

      const { cell, size } = latestIndexRef.current;
      const seg = latestSegHitRef.current;

      const ix0 = Math.floor(Math.min(prev.x, curr.x) / size) - 1;
      const ix1 = Math.floor(Math.max(prev.x, curr.x) / size) + 1;
      const iy0 = Math.floor(Math.min(prev.y, curr.y) / size) - 1;
      const iy1 = Math.floor(Math.max(prev.y, curr.y) / size) + 1;

      const ids = new Set<number>();
      for (let ix = ix0; ix <= ix1; ix++) {
        for (let iy = iy0; iy <= iy1; iy++) {
          const arr = cell[`${ix},${iy}`];
          if (!arr) continue;
          for (const id of arr) ids.add(id);
        }
      }

      for (const id of ids) {
        const e = edges[id];
        const hit = seg(e.ax, e.ay, e.bx, e.by, prev.x, prev.y, curr.x, curr.y);
        if (hit && !tooRecentHit(hit.x, hit.y))
          emit(hit.x, hit.y, ux, uy, base);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emit, tooRecentHit, edges]
  );

  const ensureSized = useCallback(
    (
      cvs: HTMLCanvasElement,
      cssW: number,
      cssH: number,
      deviceScale: number
    ) => {
      const needW = Math.max(1, Math.floor(cssW * deviceScale));
      const needH = Math.max(1, Math.floor(cssH * deviceScale));
      if (cvs.width !== needW || cvs.height !== needH) {
        cvs.width = needW;
        cvs.height = needH;
        const sw = `${Math.round(cssW)}px`;
        const sh = `${Math.round(cssH)}px`;
        if (cvs.style.width !== sw) cvs.style.width = sw;
        if (cvs.style.height !== sh) cvs.style.height = sh;
      }
    },
    []
  );

  const loop = useCallback(() => {
    const id = requestAnimationFrame(loop);
    rafRef.current = id;

    const main = canvasRef.current;
    const mask = maskRef.current;
    const img = image;
    if (!main || !mask || !img || status !== 'ready') return;

    const { width: W, height: H, dpr: DPR } = latestDimsRef.current;
    const cfg = configRef.current;

    ensureSized(main, W, H, DPR);
    ensureSized(mask, W * MASK_SCALE, H * MASK_SCALE, DPR);

    const ctx = main.getContext('2d');
    const mctx = mask.getContext('2d');
    if (!ctx || !mctx) return;

    const now = performance.now();
    const last = lastTsRef.current ?? now;
    const dt = Math.max(0, (now - last) / 1000);
    lastTsRef.current = now;

    const next: Particle[] = [];

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const hasParticles = particlesRef.current.length > 0;

    if (hasParticles) {
      for (const p of particlesRef.current) {
        const age = (now - p.born) / 1000;
        const k = 1 - age / p.life;
        if (k <= 0) continue;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const alpha = clamp(k, 0, 1);
        const rNow = Math.max(0.75, p.radius * (0.7 + 0.6 * k));

        ctx.globalAlpha = alpha;
        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rNow, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 0.012, p.y - p.vy * 0.012);
        ctx.lineTo(p.x, p.y);
        ctx.lineWidth = rNow;
        ctx.strokeStyle = cfg.color;
        ctx.lineCap = 'round';
        ctx.stroke();

        next.push(p);
      }
      particlesRef.current = next;
    } else if (cfg.revealDecayPerSec <= 0) {
      return;
    }

    const mW = W * MASK_SCALE;
    const mH = H * MASK_SCALE;

    mctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    if (cfg.revealDecayPerSec > 0) {
      const decay = 1 - Math.exp(-cfg.revealDecayPerSec * dt);
      mctx.globalCompositeOperation = 'destination-out';
      mctx.globalAlpha = decay;
      mctx.fillStyle = '#000';
      mctx.fillRect(0, 0, mW, mH);
      mctx.globalCompositeOperation = 'source-over';
    } else {
      mctx.clearRect(0, 0, mW, mH);
    }

    if (next.length > 0) {
      mctx.globalCompositeOperation = 'lighter';
      for (const p of next) {
        const age = (now - p.born) / 1000;
        const k = clamp(1 - age / p.life, 0, 1);
        const theta = Math.atan2(p.vy, p.vx);
        const len =
          Math.max(16, cfg.revealRadiusPx * 0.9) * (0.7 + 0.6 * (1 - k));
        const lw = Math.max(10, cfg.revealFeatherPx * 0.55) * (0.7 + 0.5 * k);
        mctx.save();
        mctx.translate(p.x * MASK_SCALE, p.y * MASK_SCALE);
        mctx.rotate(theta);
        mctx.globalAlpha = 0.65 * k;
        mctx.strokeStyle = '#ffffff';
        mctx.lineWidth = lw * MASK_SCALE;
        mctx.lineCap = 'round';
        mctx.beginPath();
        mctx.moveTo(-len * 0.5 * MASK_SCALE, 0);
        mctx.lineTo(len * 0.5 * MASK_SCALE, 0);
        mctx.stroke();
        mctx.restore();
      }
      mctx.globalCompositeOperation = 'source-over';
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(img as CanvasImageSource, 0, 0, W, H);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }, [status, image, ensureSized, latestDimsRef, configRef]);

  useEffect(() => {
    const id = requestAnimationFrame(loop);
    rafRef.current = id;
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [loop]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const rect = () => host.getBoundingClientRect();
    const clamp = (v: number, lo: number, hi: number) =>
      v < lo ? lo : v > hi ? hi : v;

    const toLocal = (cx: number, cy: number) => {
      const r = rect();
      const { width: W, height: H } = latestDimsRef.current;
      return {
        x: clamp(cx - r.left, 0, W),
        y: clamp(cy - r.top, 0, H),
      };
    };

    const onPointerDown = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      const r = rect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      ) {
        return;
      }
      downPt.current = p;
      lastPt.current = p;
      lastMoveTs.current = performance.now();
      dragging.current = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!downPt.current) return;
      const p = toLocal(e.clientX, e.clientY);
      const t = performance.now();

      if (!dragging.current) {
        const dx = p.x - (downPt.current?.x ?? p.x);
        const dy = p.y - (downPt.current?.y ?? p.y);
        if (Math.hypot(dx, dy) >= configRef.current.dragThresholdPx)
          dragging.current = true;
      }

      if (dragging.current && lastPt.current && lastMoveTs.current != null) {
        const dtSec = Math.max(0.001, (t - lastMoveTs.current) / 1000);
        if (isInsideHost(e.clientX, e.clientY)) {
          onDragMove(lastPt.current, p, dtSec);
        }
        lastPt.current = p;
        lastMoveTs.current = t;
      }
    };

    const onPointerUp = () => {
      downPt.current = null;
      dragging.current = false;
      lastPt.current = null;
      lastMoveTs.current = null;
      recentHitsRef.current = [];
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0] || e.changedTouches[0];
      if (!t) return;
      const r = rect();
      if (
        t.clientX < r.left ||
        t.clientX > r.right ||
        t.clientY < r.top ||
        t.clientY > r.bottom
      )
        return;
      activeTouchId.current = t.identifier;
      const p = toLocal(t.clientX, t.clientY);
      downPt.current = p;
      lastPt.current = p;
      lastMoveTs.current = performance.now();
      dragging.current = false;
      if (lockScrollOnTouch) document.body.style.touchAction = 'none';
    };

    const onTouchMove = (e: TouchEvent) => {
      let t: Touch | null = null;
      if (activeTouchId.current != null) {
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === activeTouchId.current) {
            t = e.touches[i];
            break;
          }
        }
      }
      if (!t) t = e.touches[0] || null;
      if (!t) return;
      if (lockScrollOnTouch) e.preventDefault();
      const p = toLocal(t.clientX, t.clientY);
      if (!downPt.current) return;
      const now = performance.now();
      if (!dragging.current) {
        const dx = p.x - downPt.current.x;
        const dy = p.y - downPt.current.y;
        if (Math.hypot(dx, dy) >= configRef.current.dragThresholdPx)
          dragging.current = true;
      }
      if (dragging.current && lastPt.current && lastMoveTs.current != null) {
        const dtSec = Math.max(0.001, (now - lastMoveTs.current) / 1000);
        if (isInsideHost(t.clientX, t.clientY)) {
          onDragMove(lastPt.current, p, dtSec);
        }
        lastPt.current = p;
        lastMoveTs.current = now;
      }
    };

    const onTouchEnd = () => {
      activeTouchId.current = null;
      downPt.current = null;
      dragging.current = false;
      lastPt.current = null;
      lastMoveTs.current = null;
      recentHitsRef.current = [];
      if (lockScrollOnTouch) document.body.style.touchAction = '';
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (lockScrollOnTouch) document.body.style.touchAction = '';
    };
  }, [onDragMove, isInsideHost, lockScrollOnTouch, latestDimsRef, configRef]);

  if (!d || width <= 0 || height <= 0 || edges.length === 0) return null;

  return (
    <div
      ref={hostRef}
      className={cn(className, 'pointer-events-none absolute inset-0')}
      style={{ zIndex }}
      aria-hidden
    >
      <canvas ref={canvasRef} />
      <canvas ref={maskRef} style={{ display: 'none' }} />
    </div>
  );
}

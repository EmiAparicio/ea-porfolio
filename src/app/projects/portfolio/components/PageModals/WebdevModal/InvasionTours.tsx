'use client';

import { useLang } from '@i18n/client';
import HexButton from '@portfolio/components/HexButton/HexButton';
import Spinner from '@portfolio/components/Spinner';
import useWindowSize from '@portfolio/hooks/useWindowSize';
import cn from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';
import { FaGithub } from 'react-icons/fa';

export type InvasionToursProps = {
  /** Optional CSS class for the container */
  className?: string;
  /** Milliseconds before showing the fallback spinner */
  loaderDelayMs?: number;
};

const SPINNER_HIDE_AFTER_LOAD_MS = 500;
const IFRAME_SHOW_AFTER_LOAD_MS = 1000;

const InvasionTours: FC<InvasionToursProps> = ({
  className,
  loaderDelayMs = 180,
}) => {
  const { deviceType } = useWindowSize();
  const { dict } = useLang();

  const [loaded, setLoaded] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [iframeVisible, setIframeVisible] = useState<boolean>(false);

  const loaderTimer = useRef<number | null>(null);
  const hideSpinnerTimer = useRef<number | null>(null);
  const showIframeTimer = useRef<number | null>(null);

  useEffect(() => {
    setLoaded(false);
    setShowLoader(false);
    setIframeVisible(false);

    if (loaderTimer.current) window.clearTimeout(loaderTimer.current);
    if (hideSpinnerTimer.current) window.clearTimeout(hideSpinnerTimer.current);
    if (showIframeTimer.current) window.clearTimeout(showIframeTimer.current);

    loaderTimer.current = window.setTimeout(() => {
      setShowLoader(true);
    }, loaderDelayMs);

    return () => {
      if (loaderTimer.current) window.clearTimeout(loaderTimer.current);
      if (hideSpinnerTimer.current)
        window.clearTimeout(hideSpinnerTimer.current);
      if (showIframeTimer.current) window.clearTimeout(showIframeTimer.current);
    };
  }, [loaderDelayMs]);

  const onReady = () => {
    if (loaded) return;
    setLoaded(true);

    if (hideSpinnerTimer.current) window.clearTimeout(hideSpinnerTimer.current);
    if (showIframeTimer.current) window.clearTimeout(showIframeTimer.current);

    hideSpinnerTimer.current = window.setTimeout(() => {
      setShowLoader(false);
    }, SPINNER_HIDE_AFTER_LOAD_MS);

    showIframeTimer.current = window.setTimeout(() => {
      setIframeVisible(true);
    }, IFRAME_SHOW_AFTER_LOAD_MS);
  };

  return (
    <div className="pointer-events-none relative h-full w-full">
      <div
        className={cn('pointer-events-none relative h-full w-full', className)}
      >
        <iframe
          src="https://www.youtube.com/embed/fdYPMU1pSoU"
          title="Invasion Tours - Henry Individual Project"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{
            visibility: loaded ? 'visible' : 'hidden',
            opacity: iframeVisible ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
          loading="lazy"
          onLoad={onReady}
          onError={onReady}
          className={cn(
            'no-custom-cursor pointer-events-auto absolute top-[40%] left-1/2 aspect-video -translate-1/2 border-none',
            !iframeVisible && 'pointer-events-none',
            deviceType === 'web' && 'h-[60%]',
            deviceType !== 'web' && 'w-[90%]',
            deviceType === 'mobile' && '!top-1/2'
          )}
        />

        {showLoader && (
          <Spinner
            hasOverlay
            className="absolute top-[40%] left-1/2 -translate-1/2"
          />
        )}
      </div>
      <HexButton
        id="invasion-tours-repository"
        title={dict.pages.webdev.github}
        label={dict.pages.webdev.github}
        icon={FaGithub}
        sizeFactor={1.5}
        iconScale="40%"
        labelSizeFactor={0.8}
        labelElevation={0.2}
        href="https://github.com/EmiAparicio/HenryCountriesPI-InvasionTours"
        toggleable={false}
        showLabelOnToggled={true}
        className={cn(
          'pointer-events-auto !absolute',
          deviceType === 'web' && 'top-1/2 left-[5%]',
          deviceType !== 'web' && '-bottom-[2.5%] left-1/2'
        )}
      />
    </div>
  );
};

export default InvasionTours;

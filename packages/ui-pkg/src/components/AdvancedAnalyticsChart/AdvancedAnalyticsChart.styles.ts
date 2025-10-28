import styled from 'styled-components';

export const ChartWrapper = styled.div`
  font-family: 'Nunito', sans-serif;
  background-color: var(--bg-surface);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-default);
  height: 100%;
  width: 100%;

  .recharts-wrapper:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .recharts-legend-item-text {
    color: var(--text-secondary) !important;
  }

  .recharts-label {
    fill: var(--text-secondary);
    font-size: 0.875rem;
  }

  .recharts-cartesian-axis-tick-value {
    fill: var(--text-secondary);
    font-size: 0.75rem;
  }

  .recharts-cartesian-axis-line {
    stroke: var(--border-default);
  }

  .recharts-cartesian-grid-line {
    stroke: var(--border-subtle);
  }

  .recharts-brush,
  .recharts-brush-slide,
  .recharts-brush-traveller {
    touch-action: pan-y;
  }

  .recharts-brush-slide {
    fill: var(--bg-surface-elevated);
    stroke: var(--border-strong);
    cursor: grab;
  }

  .recharts-brush-traveller {
    fill: var(--color-accent-hover);
    stroke: var(--border-strong);
    cursor: ew-resize;
  }

  .recharts-brush-texts {
    fill: var(--text-secondary);
  }
`;

export const TooltipWrapper = styled.div`
  background-color: var(--bg-popover);
  border-radius: 6px;
  box-shadow: var(--shadow-popover);
  border: 1px solid var(--border-default);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;

  .tooltip-label {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .tooltip-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;

    .tooltip-color-swatch {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .tooltip-item-name {
      color: var(--text-secondary);
    }

    .tooltip-item-value {
      color: var(--text-primary);
      font-weight: 600;
      margin-left: auto;
    }
  }
`;

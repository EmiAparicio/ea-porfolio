import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdvancedAnalyticsChart,
  type AdvancedAnalyticsChartProps,
} from './AdvancedAnalyticsChart';

const mockTimeData = [
  { date: '2023-01-01T00:00:00Z', revenue: 120000, units: 500 },
  { date: '2023-01-02T00:00:00Z', revenue: 115000, units: 480 },
  { date: '2023-01-03T00:00:00Z', revenue: 135000, units: 520 },
  { date: '2023-01-04T00:00:00Z', revenue: 140000, units: 530 },
  { date: '2023-01-05T00:00:00Z', revenue: 155000, units: 550 },
  { date: '2023-01-06T00:00:00Z', revenue: 180000, units: 600 },
  { date: '2023-01-07T00:00:00Z', revenue: 175000, units: 590 },
  { date: '2023-01-08T00:00:00Z', revenue: 160000, units: 570 },
  { date: '2023-01-09T00:00:00Z', revenue: 165000, units: 580 },
  { date: '2023-01-10T00:00:00Z', revenue: 190000, units: 620 },
  { date: '2023-01-11T00:00:00Z', revenue: 210000, units: 650 },
  { date: '2023-01-12T00:00:00Z', revenue: 205000, units: 640 },
  { date: '2023-01-13T00:00:00Z', revenue: 195000, units: 610 },
  { date: '2023-01-14T00:00:00Z', revenue: 185000, units: 600 },
  { date: '2023-01-15T00:00:00Z', revenue: 200000, units: 630 },
  { date: '2023-01-16T00:00:00Z', revenue: 220000, units: 660 },
  { date: '2023-01-17T00:00:00Z', revenue: 215000, units: 655 },
  { date: '2023-01-18T00:00:00Z', revenue: 230000, units: 680 },
  { date: '2023-01-19T00:00:00Z', revenue: 225000, units: 670 },
  { date: '2023-01-20T00:00:00Z', revenue: 240000, units: 700 },
  { date: '2023-01-21T00:00:00Z', revenue: 235000, units: 690 },
  { date: '2023-01-22T00:00:00Z', revenue: 220000, units: 660 },
  { date: '2023-01-23T00:00:00Z', revenue: 210000, units: 640 },
  { date: '2023-01-24T00:00:00Z', revenue: 225000, units: 670 },
  { date: '2023-01-25T00:00:00Z', revenue: 235000, units: 685 },
  { date: '2023-01-26T00:00:00Z', revenue: 250000, units: 710 },
  { date: '2023-01-27T00:00:00Z', revenue: 245000, units: 705 },
  { date: '2023-01-28T00:00:00Z', revenue: 260000, units: 730 },
  { date: '2023-01-29T00:00:00Z', revenue: 255000, units: 720 },
  { date: '2023-01-30T00:00:00Z', revenue: 270000, units: 750 },
];
const mockCategoryData = [
  { category: 'Q1 2023', revenue: 405000, units: 1570 },
  { category: 'Q2 2023', revenue: 565000, units: 1740 },
  { category: 'Q3 2023', revenue: 510000, units: 1600 },
];

const defaultProps: AdvancedAnalyticsChartProps<(typeof mockTimeData)[0]> = {
  data: mockTimeData,
  xAxisKey: 'date',
  barDataKey: 'units',
  lineDataKey: 'revenue',
  barName: 'Units Sold',
  lineName: 'Revenue',
  yAxisLeftLabel: 'Revenue (USD)',
  yAxisRightLabel: 'Units',
  enableDataBrush: true,
  xAxisFormatType: 'time',
  yAxisLeftFormat: '$,.0s',
  yAxisRightFormat: '.0s',
  xAxisTickFormat: '%b %d',
};

let resizeObserverCallback: (
  entries: { contentRect: { width: number; height: number } }[]
) => void;
const mockResizeObserver = vi.fn((callback) => {
  resizeObserverCallback = callback;
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});
const triggerResize = (width: number) => {
  act(() => {
    resizeObserverCallback([
      {
        contentRect: { width, height: 500 },
      },
    ]);
  });
};

describe('AdvancedAnalyticsChart', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', mockResizeObserver);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render all elements correctly on desktop', () => {
    render(<AdvancedAnalyticsChart {...defaultProps} />);
    triggerResize(1024);

    expect(
      screen.getByRole('figure', {
        name: 'Advanced Analytics Chart showing Revenue and Units Sold',
      })
    ).toBeInTheDocument();

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Units Sold')).toBeInTheDocument();
    expect(screen.getByText('Revenue (USD)')).toBeInTheDocument();
    expect(screen.getByText('Units')).toBeInTheDocument();

    expect(screen.getByText('$200k')).toBeInTheDocument();
    expect(screen.getByText('600')).toBeInTheDocument();

    const xAxisTicks = screen.getAllByText(/^\w{3}\s\d{2}$/);
    expect(xAxisTicks.length).toBeGreaterThan(0);

    const avgLabel = screen.getByText(/Avg: \$200k/);
    expect(avgLabel).toBeInTheDocument();

    expect(document.querySelector('.recharts-brush')).toBeInTheDocument();
  });

  it('should adapt to mobile viewports', () => {
    render(<AdvancedAnalyticsChart {...defaultProps} />);
    triggerResize(400);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Units Sold')).toBeInTheDocument();
    expect(screen.getByText('Revenue (USD)')).toBeInTheDocument();
    expect(screen.getByText('Units')).toBeInTheDocument();

    const brushTextsContainer = document.querySelector('.recharts-brush-texts');
    expect(
      brushTextsContainer === null || brushTextsContainer.textContent === ''
    ).toBe(true);

    const xAxisContainer = document.querySelector('.recharts-xAxis');
    const hasCorrectlyFormattedTick = Array.from(
      xAxisContainer?.querySelectorAll(
        'text.recharts-cartesian-axis-tick-value'
      ) || []
    ).some((node) => /^\w{3}\s\d{2}$/.test(node.textContent || ''));
    expect(hasCorrectlyFormattedTick).toBe(true);

    expect(document.querySelector('.recharts-brush')).toBeInTheDocument();
  });

  it('should render categorical data correctly', () => {
    const props: AdvancedAnalyticsChartProps<(typeof mockCategoryData)[0]> = {
      data: mockCategoryData,
      xAxisKey: 'category',
      barDataKey: 'units',
      lineDataKey: 'revenue',
      barName: 'Units Sold',
      lineName: 'Revenue',
      yAxisLeftLabel: 'Revenue (USD)',
      yAxisRightLabel: 'Units',
      enableDataBrush: true,
      xAxisFormatType: 'category',
      yAxisLeftFormat: '$,.0s',
      yAxisRightFormat: '.0s',
      xAxisTickFormat: '',
    };
    render(<AdvancedAnalyticsChart {...props} />);
    triggerResize(1024);

    expect(screen.getAllByText('Q1 2023').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Q3 2023').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelector('.recharts-brush')).toBeInTheDocument();
  });

  it('should not render the brush if disabled', () => {
    render(
      <AdvancedAnalyticsChart {...defaultProps} enableDataBrush={false} />
    );
    triggerResize(1024);

    const brush = document.querySelector('.recharts-brush');
    expect(brush).not.toBeInTheDocument();
  });
});

import i18n from '@i18n';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
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
  { category: 'Q4 2023', revenue: 620000, units: 1850 },
  { category: 'Q1 2024', revenue: 450000, units: 1650 },
];

type MockData = {
  date?: string;
  category?: string;
  revenue: number;
  units: number;
};

type ChartStoryProps = AdvancedAnalyticsChartProps<MockData> & {
  storyTheme?: 'light' | 'dark';
};

const ThemeDecorator: Decorator<ChartStoryProps> = (Story, context) => {
  const { storyTheme = 'light' } = context.args;
  return (
    <div
      data-theme={storyTheme}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '500px',
        borderRadius: '6px',
        background: 'var(--bg-app)',
        boxSizing: 'border-box',
        transition: 'background-color 0.3s ease',
        touchAction: 'pan-y',
      }}
    >
      <Story />
    </div>
  );
};

const meta: Meta<ChartStoryProps> = {
  title: 'Components/AdvancedAnalyticsChart',
  component: AdvancedAnalyticsChart,
  tags: ['autodocs'],
  decorators: [ThemeDecorator],
  parameters: {
    docs: {
      description: {
        component: i18n.t('advancedAnalyticsChart.meta.description'),
      },
    },
  },
  argTypes: {
    storyTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
      description: i18n.t('storyTheme.description'),
      table: { category: 'Story Config', type: { summary: undefined } },
    },
    data: {
      control: false,
      description: i18n.t('advancedAnalyticsChart.argTypes.data.description'),
      table: { category: 'Data' },
    },
    xAxisKey: {
      control: 'inline-radio',
      options: ['date', 'category'],
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.xAxisKey.description'
      ),
      table: { category: 'Data' },
    },
    barDataKey: {
      control: false,
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.barDataKey.description'
      ),
      table: { category: 'Data' },
    },
    lineDataKey: {
      control: false,
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.lineDataKey.description'
      ),
      table: { category: 'Data' },
    },
    barName: {
      control: 'text',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.barName.description'
      ),
      table: { category: 'Labels' },
    },
    lineName: {
      control: 'text',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.lineName.description'
      ),
      table: { category: 'Labels' },
    },
    yAxisLeftLabel: {
      control: 'text',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.yAxisLeftLabel.description'
      ),
      table: { category: 'Labels' },
    },
    yAxisRightLabel: {
      control: 'text',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.yAxisRightLabel.description'
      ),
      table: { category: 'Labels' },
    },
    enableDataBrush: {
      control: 'boolean',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.enableDataBrush.description'
      ),
      table: { category: 'Behavior' },
    },
    xAxisFormatType: {
      control: 'inline-radio',
      options: ['time', 'category'],
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.xAxisFormatType.description'
      ),
      table: { category: 'Formatting' },
    },
    yAxisLeftFormat: {
      control: 'text',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.yAxisLeftFormat.description'
      ),
      table: { category: 'Formatting' },
    },
    yAxisRightFormat: {
      control: 'text',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.yAxisRightFormat.description'
      ),
      table: { category: 'Formatting' },
    },
    tooltipDateFormat: {
      control: 'text',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.tooltipDateFormat.description'
      ),
      table: { category: 'Formatting' },
    },
    tooltipValueFormat: {
      control: 'text',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.tooltipValueFormat.description'
      ),
      table: { category: 'Formatting' },
    },
    xAxisTickFormat: {
      control: 'text',
      description: i18n.t(
        'advancedAnalyticsChart.argTypes.xAxisTickFormat.description'
      ),
      table: { category: 'Formatting' },
    },
  },
  args: {
    storyTheme: 'light',
    enableDataBrush: true,
    xAxisKey: 'date',
    barDataKey: 'units',
    lineDataKey: 'revenue',
    xAxisFormatType: 'time',
    yAxisLeftFormat: '$,.0s',
    yAxisRightFormat: '.0s',
    tooltipDateFormat: '%B %d, %Y',
    tooltipValueFormat: '$,.2f',
    xAxisTickFormat: '%b %d',
    barName: i18n.t('advancedAnalyticsChart.args.barName'),
    lineName: i18n.t('advancedAnalyticsChart.args.lineName'),
    yAxisLeftLabel: i18n.t('advancedAnalyticsChart.args.yAxisLeftLabel'),
    yAxisRightLabel: i18n.t('advancedAnalyticsChart.args.yAxisRightLabel'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: i18n.t('advancedAnalyticsChart.stories.primary.name'),
  render: (args) => {
    const data = args.xAxisKey === 'category' ? mockCategoryData : mockTimeData;

    const formatType =
      args.xAxisKey === 'category' ? 'category' : args.xAxisFormatType;

    const tickFormat =
      args.xAxisKey === 'category' ? undefined : args.xAxisTickFormat;

    const tooltipFormat =
      args.xAxisKey === 'category' ? '%Y-%m-%d' : args.tooltipDateFormat;

    return (
      <AdvancedAnalyticsChart
        {...args}
        data={data as MockData[]}
        xAxisFormatType={formatType}
        xAxisTickFormat={tickFormat}
        tooltipDateFormat={tooltipFormat}
      />
    );
  },
};

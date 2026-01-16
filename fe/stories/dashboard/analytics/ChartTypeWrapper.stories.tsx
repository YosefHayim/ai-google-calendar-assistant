import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ChartTypeWrapper } from '@/components/dashboard/analytics/ChartTypeWrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const meta: Meta<typeof ChartTypeWrapper> = {
  title: 'Dashboard/Analytics/ChartTypeWrapper',
  component: ChartTypeWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ChartTypeWrapper<string>>

const SAMPLE_CHART_TYPES = ['bar', 'line', 'area'] as const

const MockChart = ({ type }: { type: string }) => (
  <div className="h-[200px] bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
    <span className="text-zinc-500 dark:text-zinc-400 font-medium capitalize">{type} Chart Placeholder</span>
  </div>
)

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Sample Chart with Type Switcher</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartTypeWrapper chartId="sample-chart" chartTypes={SAMPLE_CHART_TYPES} defaultType="bar">
          {(chartType) => <MockChart type={chartType} />}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  ),
}

export const WithLabels: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Chart with Custom Labels</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartTypeWrapper
          chartId="labeled-chart"
          chartTypes={SAMPLE_CHART_TYPES}
          defaultType="line"
          labels={{
            bar: 'Bars',
            line: 'Lines',
            area: 'Areas',
          }}
        >
          {(chartType) => <MockChart type={chartType} />}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  ),
}

export const TabsOnLeft: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Chart with Left-Aligned Tabs</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartTypeWrapper
          chartId="left-tabs-chart"
          chartTypes={SAMPLE_CHART_TYPES}
          defaultType="area"
          tabsPosition="left"
        >
          {(chartType) => <MockChart type={chartType} />}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  ),
}

const EXTENDED_CHART_TYPES = ['bar', 'line', 'area', 'stacked', 'pie'] as const

export const ManyChartTypes: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Chart with Many Type Options</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartTypeWrapper chartId="many-types-chart" chartTypes={EXTENDED_CHART_TYPES} defaultType="bar">
          {(chartType) => <MockChart type={chartType} />}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  ),
}

export const WithCustomClassName: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Chart with Custom Styling</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartTypeWrapper
          chartId="custom-class-chart"
          chartTypes={SAMPLE_CHART_TYPES}
          defaultType="bar"
          className="border border-dashed border-zinc-300 dark:border-zinc-700 p-4 rounded-lg"
        >
          {(chartType) => <MockChart type={chartType} />}
        </ChartTypeWrapper>
      </CardContent>
    </Card>
  ),
}

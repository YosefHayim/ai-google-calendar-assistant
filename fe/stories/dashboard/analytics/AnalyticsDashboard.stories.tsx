import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AnalyticsDashboard from '@/components/dashboard/analytics/AnalyticsDashboard'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const meta: Meta<typeof AnalyticsDashboard> = {
  title: 'Dashboard/Analytics/AnalyticsDashboard',
  component: AnalyticsDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

const ProviderWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </LanguageProvider>
  </QueryClientProvider>
)

export const Default: Story = {
  args: {
    isLoading: false,
  },
  decorators: [
    (Story) => (
      <ProviderWrapper>
        <Story />
      </ProviderWrapper>
    ),
  ],
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
  decorators: [
    (Story) => (
      <ProviderWrapper>
        <Story />
      </ProviderWrapper>
    ),
  ],
}

export const LoadingState: Story = {
  render: () => {
    return (
      <div className="p-4 text-center text-zinc-500">
        <p className="mb-4">The AnalyticsDashboard requires the full AnalyticsContext with API data.</p>
        <p>To test the full dashboard, run the application locally with proper backend connection.</p>
        <p className="mt-4 text-sm">Individual chart components can be tested in their respective story files:</p>
        <ul className="mt-2 text-sm list-disc list-inside">
          <li>BentoStatsGrid.stories.tsx</li>
          <li>TimeAllocationChart.stories.tsx</li>
          <li>WeeklyPatternDashboard.stories.tsx</li>
          <li>MonthlyPatternChart.stories.tsx</li>
          <li>DailyAvailableHoursChart.stories.tsx</li>
          <li>EventDurationDashboard.stories.tsx</li>
          <li>FocusTimeTracker.stories.tsx</li>
          <li>ScheduleHealthScore.stories.tsx</li>
          <li>RecentEvents.stories.tsx</li>
          <li>UpcomingWeekPreview.stories.tsx</li>
          <li>InsightCard.stories.tsx</li>
          <li>TimeDistributionChart.stories.tsx</li>
        </ul>
      </div>
    )
  },
}

const PlaceholderComponent = ({ viewName }: { viewName: string }) => (
  <div className="flex-1 flex items-center justify-center p-4 h-full">
    <h1 className="text-2xl md:text-4xl font-bold text-zinc-300 dark:text-zinc-700">{viewName} View</h1>
  </div>
)

export default function SchedulePage() {
  return <PlaceholderComponent viewName="Schedule" />
}

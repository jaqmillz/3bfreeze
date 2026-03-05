export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border bg-card"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg border bg-card" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="bg-gray-100">
      <div className="container mx-auto max-w-screen-sm px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
          <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200"></div>
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-center">
              <div className="w-[400px] rounded-2xl bg-white/90 p-4 shadow-lg">
                <div className="mb-4 h-6 animate-pulse rounded bg-gray-200"></div>
                <div className="mb-4 space-y-2">
                  <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="mb-2 h-4 animate-pulse rounded bg-gray-200"></div>
                <div className="h-2 animate-pulse rounded-full bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

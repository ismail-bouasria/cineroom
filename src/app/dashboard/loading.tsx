import { Film } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-5 w-96 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-white/10 rounded-lg animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* List Skeleton */}
        <div className="bg-white/5 rounded-2xl py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
              <Film className="w-5 h-5 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-white/40">Chargement...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

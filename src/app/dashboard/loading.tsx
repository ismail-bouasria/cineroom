import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Spinner } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-5 w-96 bg-slate-800/50 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-16 h-16 bg-slate-800 rounded-xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* List Skeleton */}
        <Card>
          <CardContent className="py-12">
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

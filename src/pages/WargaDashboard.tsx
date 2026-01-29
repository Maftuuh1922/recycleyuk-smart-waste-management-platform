import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { Request } from '@shared/types';
import { RequestCard } from '@/components/RequestCard';
import { NewRequestDialog } from '@/components/NewRequestDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Clock, CheckCircle2, History as HistoryIcon, Navigation, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function WargaDashboard() {
  const user = useAuthStore(s => s.user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['requests', user?.id],
    queryFn: () => api<Request[]>(`/api/requests?userId=${user?.id}&role=WARGA`),
    enabled: !!user?.id,
    refetchInterval: 10000,
  });
  const activeRequests = requests?.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && r.status !== 'VALIDATED') ?? [];
  const completedRequests = requests?.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'VALIDATED') ?? [];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Manage your household waste collection requests.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 rounded-full shadow-lg shadow-emerald-500/20">
            <Plus className="mr-2 h-5 w-5" /> New Pickup Request
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Pickups" value={requests?.length ?? 0} icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />} />
          <StatCard title="Active Requests" value={activeRequests.length} icon={<Clock className="h-6 w-6 text-amber-500" />} />
          <StatCard title="Points Earned" value={(requests?.length ?? 0) * 50} icon={<Trophy className="h-6 w-6 text-amber-600" />} />
        </div>
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Active Pickups
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : activeRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeRequests.map(req => (
                <RequestCard key={req.id} request={req}>
                  {(req.status === 'ACCEPTED' || req.status === 'ON_THE_WAY' || req.status === 'ARRIVED') && (
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 mt-2 rounded-lg">
                      <Link to={`/tracking/${req.id}`}>
                        <Navigation className="mr-2 h-4 w-4" /> Track Live Movement
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild className="w-full mt-2">
                    <Link to={`/request/${req.id}`}>View Details</Link>
                  </Button>
                </RequestCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 border-2 border-dashed rounded-3xl">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No active pickups at the moment.</p>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="text-emerald-600 border-emerald-200">
                  Create your first request
                </Button>
              </div>
            </div>
          )}
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-muted-foreground">
            <HistoryIcon className="h-5 w-5" />
            Recent History
          </h2>
          {completedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70 grayscale-[0.3]">
              {completedRequests.map(req => (
                <RequestCard key={req.id} request={req}>
                   <Button variant="ghost" asChild className="w-full mt-2">
                    <Link to={`/request/${req.id}`}>View Receipt</Link>
                  </Button>
                </RequestCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground italic bg-muted/5 rounded-xl border">
              Your pickup history will appear here once completed.
            </div>
          )}
        </section>
        <NewRequestDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={() => {
            refetch();
            setIsDialogOpen(false);
          }}
        />
      </div>
    </AppLayout>
  );
}
function StatCard({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-card p-6 rounded-3xl border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
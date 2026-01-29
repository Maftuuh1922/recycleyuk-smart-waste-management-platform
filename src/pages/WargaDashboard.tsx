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
import { Plus, Clock, CheckCircle2, History as HistoryIcon, Navigation, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function WargaDashboard() {
  const user = useAuthStore(s => s.user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['requests', user?.id],
    queryFn: () => api<Request[]>(`/api/requests?userId=${user?.id}&role=WARGA`),
    enabled: !!user?.id,
    refetchInterval: 5000, // Faster polling for real-time feel
  });
  const activeRequests = requests?.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && r.status !== 'VALIDATED') ?? [];
  const completedRequests = requests?.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'VALIDATED') ?? [];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Manage your household waste collection requests.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-full shadow-lg shadow-emerald-500/25 transition-all hover:scale-105">
            <Plus className="mr-2 h-5 w-5" /> New Pickup Request
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Pickups" value={requests?.length ?? 0} icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />} />
          <StatCard title="Active Requests" value={activeRequests.length} icon={<Clock className="h-6 w-6 text-amber-500" />} />
          <StatCard title="Impact Points" value={(requests?.length ?? 0) * 50} icon={<Trophy className="h-6 w-6 text-amber-600" />} />
        </div>
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Active Pickups
            </h2>
            {activeRequests.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 animate-pulse bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <Sparkles size={12} /> Live Updates Active
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-52 w-full rounded-2xl" />
              <Skeleton className="h-52 w-full rounded-2xl" />
            </div>
          ) : activeRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeRequests.map(req => (
                <RequestCard key={req.id} request={req}>
                  {(req.status === 'ACCEPTED' || req.status === 'ON_THE_WAY' || req.status === 'ARRIVED') && (
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 mt-2 rounded-xl h-11 shadow-lg shadow-blue-500/20 font-semibold group">
                      <Link to={`/tracking/${req.id}`}>
                        <Navigation className="mr-2 h-4 w-4 group-hover:animate-bounce" /> Track Live Movement
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild className="w-full mt-2 rounded-xl h-11 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Link to={`/request/${req.id}`}>View Timeline & Chat</Link>
                  </Button>
                </RequestCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/10 border-2 border-dashed rounded-[2.5rem] border-muted">
              <div className="max-w-xs mx-auto space-y-5">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground font-semibold">No active pickups</p>
                  <p className="text-sm text-muted-foreground/60">Create a request to schedule a waste collection.</p>
                </div>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-full px-6">
                  Schedule Now
                </Button>
              </div>
            </div>
          )}
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-muted-foreground/60">
            <HistoryIcon className="h-5 w-5" />
            Recent History
          </h2>
          {completedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
              {completedRequests.map(req => (
                <RequestCard key={req.id} request={req}>
                   <Button variant="ghost" asChild className="w-full mt-2 h-10 rounded-lg">
                    <Link to={`/request/${req.id}`}>View Receipt</Link>
                  </Button>
                </RequestCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground italic bg-muted/5 rounded-2xl border border-dashed border-muted">
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
    <div className="bg-card p-6 rounded-[2rem] border shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-1">
      <div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{title}</p>
        <p className="text-4xl font-black mt-1 tracking-tight">{value}</p>
      </div>
      <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center shadow-inner">
        {icon}
      </div>
    </div>
  );
}
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
import { Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';
export default function WargaDashboard() {
  const user = useAuthStore(s => s.user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['requests', user?.id],
    queryFn: () => api<Request[]>(`/api/requests?userId=${user?.id}&role=WARGA`),
    enabled: !!user?.id,
  });
  const activeRequests = requests?.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED') ?? [];
  const completedRequests = requests?.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED') ?? [];
  return (
    <AppLayout container>
      <div className="space-y-8">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Manage your household waste collection requests.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" /> New Pickup Request
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Pickups" value={requests?.length ?? 0} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} />
          <StatCard title="Active Requests" value={activeRequests.length} icon={<Clock className="h-5 w-5 text-amber-500" />} />
          <StatCard title="Points Earned" value={(requests?.length ?? 0) * 50} icon={<div className="h-5 w-5 bg-amber-100 rounded-full flex items-center justify-center text-[10px] font-bold text-amber-600">P</div>} />
        </div>
        {/* Active Pickups */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRequests.map(req => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 border-2 border-dashed rounded-2xl">
              <p className="text-muted-foreground">No active pickups at the moment.</p>
              <Button variant="link" onClick={() => setIsDialogOpen(true)} className="text-emerald-600">Create one now</Button>
            </div>
          )}
        </section>
        {/* History */}
        {completedRequests.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-muted-foreground">
              <History className="h-5 w-5" />
              Recent History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70 grayscale-[0.5]">
              {completedRequests.map(req => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          </section>
        )}
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
    <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="h-10 w-10 bg-muted/50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
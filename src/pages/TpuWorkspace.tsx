import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { Request } from '@shared/types';
import { RequestCard } from '@/components/RequestCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { toast } from 'sonner';
export default function TpuWorkspace() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ['tpu-jobs', user?.id],
    queryFn: () => api<Request[]>(`/api/requests?userId=${user?.id}&role=TPU`),
    enabled: !!user?.id,
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) =>
      api(`/api/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tpu-jobs'] });
      toast.success("Status updated");
    }
  });
  const myTasks = useMemo(() => 
    requests?.filter(r => r.collectorId === user?.id && r.status !== 'COMPLETED' && r.status !== 'VALIDATED') ?? [],
    [requests, user?.id]
  );
  const availableJobsCount = requests?.filter(r => r.status === 'PENDING').length ?? 0;
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Collector Workspace</h1>
            <p className="text-muted-foreground">Active tasks and job management.</p>
          </div>
        </header>
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="tasks">My Tasks ({myTasks.length})</TabsTrigger>
            <TabsTrigger value="history">Job History</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="pt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full rounded-xl" /><Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ) : myTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTasks.map(req => (
                  <RequestCard key={req.id} request={req}>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {req.status === 'ACCEPTED' && (
                        <Button className="w-full" onClick={() => updateStatus.mutate({ id: req.id, status: 'ON_THE_WAY' })}>
                          <Truck className="mr-2 h-4 w-4" /> Start OTW
                        </Button>
                      )}
                      {req.status === 'ON_THE_WAY' && (
                        <Button className="w-full" variant="outline" onClick={() => updateStatus.mutate({ id: req.id, status: 'ARRIVED' })}>
                          <MapPin className="mr-2 h-4 w-4" /> Mark Arrived
                        </Button>
                      )}
                      {req.status === 'ARRIVED' && (
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus.mutate({ id: req.id, status: 'COMPLETED' })}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Finish
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${req.location.lat},${req.location.lng}`)}>
                        <Navigation className="mr-2 h-4 w-4" /> Nav
                      </Button>
                    </div>
                  </RequestCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No active tasks. {availableJobsCount} jobs available on the map.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="history" className="pt-6">
            <p className="text-muted-foreground text-center py-10">Job history feature coming soon.</p>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
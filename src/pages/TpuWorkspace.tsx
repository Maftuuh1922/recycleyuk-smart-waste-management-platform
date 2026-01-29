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
import { Truck, MapPin, CheckCircle, Navigation, Phone, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
export default function TpuWorkspace() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ['tpu-jobs', user?.id],
    queryFn: () => api<Request[]>(`/api/requests?userId=${user?.id}&role=TPU`),
    enabled: !!user?.id,
    refetchInterval: 5000,
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) =>
      api(`/api/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, collectorId: user?.id })
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tpu-jobs', user?.id] });
      if (variables.status === 'COMPLETED') {
        toast.success("Job finished! WhatsApp notification sent to resident.");
      } else {
        toast.success(`Task marked as ${variables.status.replace('_', ' ')}`);
      }
    }
  });
  const myTasks = useMemo(() =>
    requests?.filter(r => r.collectorId === user?.id && r.status !== 'COMPLETED' && r.status !== 'VALIDATED') ?? [],
    [requests, user?.id]
  );
  const availableJobsCount = requests?.filter(r => r.status === 'PENDING').length ?? 0;
  const handleCall = (name: string) => {
    toast(`Calling ${name}... (Simulated)`, {
      description: "0812-XXXX-XXXX",
      icon: <Phone className="h-4 w-4" />
    });
  };
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Collector Workspace</h1>
            <p className="text-muted-foreground">Manage your assigned routes and active tasks.</p>
          </div>
          <Button asChild variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
            <Link to="/tpu/map"><MapIcon className="mr-2 h-4 w-4" /> Find New Jobs</Link>
          </Button>
        </header>
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="tasks">My Tasks ({myTasks.length})</TabsTrigger>
            <TabsTrigger value="history">Completed Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="pt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full rounded-xl" /><Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ) : myTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myTasks.map(req => (
                  <RequestCard key={req.id} request={req}>
                    <div className="flex gap-2 mt-4">
                      {req.status === 'ACCEPTED' && (
                        <Button className="flex-1" onClick={() => updateStatus.mutate({ id: req.id, status: 'ON_THE_WAY' })} disabled={updateStatus.isPending}>
                          <Truck className="mr-2 h-4 w-4" /> Start OTW
                        </Button>
                      )}
                      {req.status === 'ON_THE_WAY' && (
                        <Button className="flex-1" variant="outline" onClick={() => updateStatus.mutate({ id: req.id, status: 'ARRIVED' })} disabled={updateStatus.isPending}>
                          <MapPin className="mr-2 h-4 w-4" /> Mark Arrived
                        </Button>
                      )}
                      {req.status === 'ARRIVED' && (
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus.mutate({ id: req.id, status: 'COMPLETED' })} disabled={updateStatus.isPending}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Finish Pickup
                        </Button>
                      )}
                      <Button variant="outline" size="icon" onClick={() => handleCall('Resident')}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${req.location.lat},${req.location.lng}`)}>
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  </RequestCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-muted/10">
                <div className="max-w-xs mx-auto space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Truck className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg">No active tasks</h3>
                  <p className="text-muted-foreground">There are {availableJobsCount} job requests available on the community map.</p>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-8">
                    <Link to="/tpu/map">View Job Map</Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="history" className="pt-6">
            <div className="text-center py-20 text-muted-foreground border rounded-xl bg-muted/5">
              Job history and earnings dashboard coming in the next update.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
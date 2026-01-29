import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { Request } from '@shared/types';
import { RequestCard } from '@/components/RequestCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, MapPin, CheckCircle, Navigation, Phone, Map as MapIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
export default function TpuWorkspace() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const [activeMutationId, setActiveMutationId] = useState<string | null>(null);
  const { data: requests, isLoading } = useQuery({
    queryKey: ['tpu-jobs', user?.id],
    queryFn: () => api<Request[]>(`/api/requests?userId=${user?.id}&role=TPU`),
    enabled: !!user?.id,
    refetchInterval: 5000,
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => {
      setActiveMutationId(id);
      return api(`/api/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, collectorId: user?.id })
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tpu-jobs', user?.id] });
      if (variables.status === 'COMPLETED') {
        toast.success("Job Finished!", {
          description: "WhatsApp notification sent: 'Your waste has been collected. Thank you for using RecycleYuk!'"
        });
      } else {
        toast.success(`Status updated to ${variables.status.replace(/_/g, ' ')}`);
      }
    },
    onSettled: () => setActiveMutationId(null)
  });
  const myTasks = useMemo(() =>
    requests?.filter(r => r.collectorId === user?.id && r.status !== 'COMPLETED' && r.status !== 'VALIDATED') ?? [],
    [requests, user?.id]
  );
  const availableJobsCount = requests?.filter(r => r.status === 'PENDING').length ?? 0;
  const handleCall = (name: string) => {
    toast(`Dialing Resident...`, {
      description: `Connecting you to Budi Santoso (0812-XXXX-XXXX)`,
      icon: <Phone className="h-4 w-4" />
    });
  };
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Collector Workspace</h1>
            <p className="text-muted-foreground mt-1">Accept, track, and complete your assigned pickup tasks.</p>
          </div>
          <Button asChild variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full">
            <Link to="/tpu/map"><MapIcon className="mr-2 h-4 w-4" /> Find New Jobs</Link>
          </Button>
        </header>
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="tasks" className="rounded-lg">My Tasks ({myTasks.length})</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="pt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-56 w-full rounded-2xl" /><Skeleton className="h-56 w-full rounded-2xl" />
              </div>
            ) : myTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myTasks.map(req => {
                  const isProcessing = activeMutationId === req.id;
                  return (
                    <RequestCard key={req.id} request={req}>
                      <div className="flex gap-2 mt-4">
                        {req.status === 'ACCEPTED' && (
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700" 
                            onClick={() => updateStatus.mutate({ id: req.id, status: 'ON_THE_WAY' })} 
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                            Start OTW
                          </Button>
                        )}
                        {req.status === 'ON_THE_WAY' && (
                          <Button 
                            className="flex-1 bg-amber-600 hover:bg-amber-700" 
                            onClick={() => updateStatus.mutate({ id: req.id, status: 'ARRIVED' })} 
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                            Mark Arrived
                          </Button>
                        )}
                        {req.status === 'ARRIVED' && (
                          <Button 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20" 
                            onClick={() => updateStatus.mutate({ id: req.id, status: 'COMPLETED' })} 
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Finish Pickup
                          </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={() => handleCall('Resident')} className="shrink-0">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${req.location.lat},${req.location.lng}`)}>
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </RequestCard>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-muted/10 border-muted">
                <div className="max-w-xs mx-auto space-y-4">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                    <Truck className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="font-bold text-lg">No active tasks</h3>
                  <p className="text-muted-foreground text-sm">You have no assigned pickups. Check the map for {availableJobsCount} available jobs in your area.</p>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-10 h-12 shadow-lg shadow-emerald-500/20">
                    <Link to="/tpu/map">Go to Job Map</Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="history" className="pt-6">
            <div className="text-center py-20 text-muted-foreground border rounded-2xl bg-muted/5 border-dashed">
              Your historical performance and weekly earnings dashboard will appear here soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
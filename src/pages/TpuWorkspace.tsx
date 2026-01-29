import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { Request } from '@shared/types';
import { RequestCard } from '@/components/RequestCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
export default function TpuWorkspace() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ['tpu-jobs', user?.id],
    queryFn: () => api<Request[]>(`/api/requests?userId=${user?.id}&role=TPU`),
    enabled: !!user?.id,
  });
  const acceptJob = useMutation({
    mutationFn: (requestId: string) => 
      api(`/api/requests/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACCEPTED', collectorId: user?.id })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tpu-jobs'] });
      toast.success("Job accepted!");
    }
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      api(`/api/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    onSuccess: (_data: any, variables: { id: string, status: string }) => {
      queryClient.invalidateQueries({ queryKey: ['tpu-jobs'] });
      toast.success(`Status updated to ${variables.status}`);
    }
  });
  const simulateMovement = useMutation({
    mutationFn: (id: string) =>
      api(`/api/requests/${id}/tracking`, {
        method: 'POST',
        body: JSON.stringify({
          lat: -6.22 + (Math.random() * 0.01),
          lng: 106.81 + (Math.random() * 0.01),
          collectorId: user?.id
        })
      })
  });
  const availableJobs = requests?.filter(r => r.status === 'PENDING') ?? [];
  const myTasks = requests?.filter(r => r.collectorId === user?.id && r.status !== 'COMPLETED') ?? [];
  // Simulate tracking for any active OTW job
  useEffect(() => {
    const otwJob = myTasks.find(t => t.status === 'ON_THE_WAY');
    if (!otwJob) return;
    const interval = setInterval(() => {
      simulateMovement.mutate(otwJob.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [myTasks, simulateMovement, user?.id]);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Collector Workspace</h1>
          <p className="text-muted-foreground">Manage your collection route and tasks.</p>
        </header>
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="available">Job Board ({availableJobs.length})</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks ({myTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="available" className="pt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ) : availableJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableJobs.map(req => (
                  <RequestCard key={req.id} request={req}>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                      onClick={() => acceptJob.mutate(req.id)}
                      disabled={acceptJob.isPending}
                    >
                      Accept Job
                    </Button>
                  </RequestCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/10 border-2 border-dashed rounded-2xl">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No available jobs nearby</p>
                <p className="text-muted-foreground">Check back later or refresh the page.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="tasks" className="pt-6">
            {myTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTasks.map(req => (
                  <RequestCard key={req.id} request={req}>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {req.status === 'ACCEPTED' && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => updateStatus.mutate({ id: req.id, status: 'ON_THE_WAY' })}
                        >
                          <Truck className="mr-2 h-4 w-4" /> Start OTW
                        </Button>
                      )}
                      {req.status === 'ON_THE_WAY' && (
                        <Button 
                          variant="outline" 
                          className="w-full border-blue-200 text-blue-700 bg-blue-50"
                          onClick={() => updateStatus.mutate({ id: req.id, status: 'ARRIVED' })}
                        >
                          <MapPin className="mr-2 h-4 w-4" /> Mark Arrived
                        </Button>
                      )}
                      {(req.status === 'ARRIVED' || req.status === 'COLLECTING') && (
                        <Button 
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => updateStatus.mutate({ id: req.id, status: 'COMPLETED' })}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Finish
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => {
                          if (req.location?.lat && req.location?.lng) {
                            window.open(`https://www.google.com/maps?q=${req.location.lat},${req.location.lng}`);
                          }
                        }}
                      >
                        Nav
                      </Button>
                    </div>
                  </RequestCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/10 border-2 border-dashed rounded-2xl">
                <p className="text-muted-foreground">You don't have any active tasks.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { MapDisplay } from '@/components/MapDisplay';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { Request, User } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Navigation, CheckCircle, Loader2 } from 'lucide-react';
export default function TpuMap() {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const { data: requests } = useQuery({
    queryKey: ['tpu-map-jobs'],
    queryFn: () => api<Request[]>(`/api/requests?role=TPU`),
    refetchInterval: 10000,
  });
  const updateOnlineStatus = useMutation({
    mutationFn: (isOnline: boolean) => api<User>(`/api/users/${user?.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isOnline })
    }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      toast.success(`You are now ${updatedUser.isOnline ? 'Online' : 'Offline'}`);
    }
  });
  const acceptJob = useMutation({
    mutationFn: (requestId: string) => api(`/api/requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTED', collectorId: user?.id })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tpu-map-jobs'] });
      toast.success("Job accepted!");
      setSelectedRequest(null);
    }
  });
  const markers = requests?.filter(r => r.status === 'PENDING').map(req => ({
    position: [req.location.lat, req.location.lng] as [number, number],
    label: req.location.address,
    wasteType: req.wasteType,
    onClick: () => setSelectedRequest(req)
  })) ?? [];
  return (
    <AppLayout className="flex flex-col h-screen">
      <div className="absolute top-20 right-4 z-[1000] bg-background/90 backdrop-blur-md border rounded-xl p-3 shadow-xl flex items-center gap-3">
        <div className="flex flex-col">
          <Label htmlFor="online-mode" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Status
          </Label>
          <span className={`text-xs font-bold ${user?.isOnline ? 'text-emerald-600' : 'text-muted-foreground'}`}>
            {user?.isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        {updateOnlineStatus.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        ) : (
          <Switch
            id="online-mode"
            checked={!!user?.isOnline}
            onCheckedChange={(val) => updateOnlineStatus.mutate(val)}
            className="data-[state=checked]:bg-emerald-600"
          />
        )}
      </div>
      <div className="flex-1 relative">
        <MapDisplay
          center={[-6.2247, 106.8077]}
          zoom={14}
          markers={markers}
          className="rounded-none border-none h-full"
        />
        {selectedRequest && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4 animate-in slide-in-from-bottom-10 duration-500">
            <Card className="shadow-2xl border-emerald-500 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 w-full" />
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl leading-tight">{selectedRequest.location.address}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedRequest.wasteType} • ~{selectedRequest.weightEstimate}kg</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setSelectedRequest(null)}>×</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 h-11"
                    onClick={() => acceptJob.mutate(selectedRequest.id)}
                    disabled={acceptJob.isPending}
                  >
                    {acceptJob.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Accept Job
                  </Button>
                  <Button variant="outline" className="h-11" onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedRequest.location.lat},${selectedRequest.location.lng}`);
                  }}>
                    <Navigation className="mr-2 h-4 w-4" /> Navigate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
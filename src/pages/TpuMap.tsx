import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { MapDisplay } from '@/components/MapDisplay';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { Request } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Navigation, Info, CheckCircle } from 'lucide-react';
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
    mutationFn: (isOnline: boolean) => api(`/api/users/${user?.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isOnline })
    }),
    onSuccess: (data: any) => {
      setUser(data);
      toast.success(`You are now ${data.isOnline ? 'Online' : 'Offline'}`);
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
  const markers = requests?.map(req => ({
    position: [req.location.lat, req.location.lng] as [number, number],
    label: req.location.address,
    wasteType: req.wasteType,
    onClick: () => setSelectedRequest(req)
  })) ?? [];
  return (
    <AppLayout className="flex flex-col h-screen">
      <div className="absolute top-16 right-4 z-[1000] bg-background/80 backdrop-blur border rounded-lg p-3 shadow-lg flex items-center gap-3">
        <Label htmlFor="online-mode" className="text-xs font-bold uppercase tracking-wider">
          {user?.isOnline ? 'Online' : 'Offline'}
        </Label>
        <Switch 
          id="online-mode" 
          checked={user?.isOnline} 
          onCheckedChange={(val) => updateOnlineStatus.mutate(val)} 
        />
      </div>
      <div className="flex-1 relative">
        <MapDisplay 
          center={[-6.2247, 106.8077]} 
          zoom={14} 
          markers={markers}
          className="rounded-none border-none h-full"
        />
        {selectedRequest && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="shadow-2xl border-emerald-500">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{selectedRequest.location.address}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRequest.wasteType} • ~{selectedRequest.weightEstimate}kg</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedRequest(null)}>×</Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => acceptJob.mutate(selectedRequest.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Accept Job
                  </Button>
                  <Button variant="outline" onClick={() => {
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
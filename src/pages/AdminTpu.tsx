import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, AlertCircle, Clock } from 'lucide-react';
import { User, Request } from '@shared/types';
import { ManualAssignDialog } from '@/components/ManualAssignDialog';
export default function AdminTpu() {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const { data: usersData = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<User[]>('/api/users/list'),
  });
  const { data: requests = [] } = useQuery({
    queryKey: ['all-requests-admin'],
    queryFn: () => api<Request[]>('/api/requests?role=ADMIN'),
  });
  const onlineTpus = useMemo(() => usersData.filter(u => u.role === 'TPU' && u.isOnline), [usersData]);
  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'PENDING'), [requests]);
  const getTpuLoad = (id: string) => {
    return requests.filter(r => r.collectorId === id && r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  };
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">TPU Logistics</h1>
          <p className="text-muted-foreground mt-1">Manage collector availability and assign pending waste pickups.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TPU Availability Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" /> Online TPU Fleet
            </h2>
            <div className="space-y-3">
              {onlineTpus.length > 0 ? onlineTpus.map(tpu => (
                <Card key={tpu.id} className="rounded-2xl border shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{tpu.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Current Load: {getTpuLoad(tpu.id)} tasks</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px]">Active</Badge>
                  </CardContent>
                </Card>
              )) : (
                <div className="py-10 text-center text-muted-foreground italic bg-muted/20 rounded-2xl border border-dashed">
                  No collectors online.
                </div>
              )}
            </div>
          </div>
          {/* Pending Queue Main */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" /> Pending Queue
              </h2>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700">{pendingRequests.length} Waiting</Badge>
            </div>
            {pendingRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map(req => (
                  <Card key={req.id} className="border-emerald-100 hover:shadow-md transition-all group rounded-2xl">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px] font-black">{req.wasteType}</Badge>
                        <span className="text-[10px] text-muted-foreground uppercase font-black">UNASSIGNED</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm font-semibold">
                        <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{req.location.address}</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 h-10 rounded-xl transition-transform active:scale-95"
                        onClick={() => { setSelectedRequest(req); setAssignDialogOpen(true); }}
                      >
                        <Truck className="mr-2 h-3.5 w-3.5" /> Manual Assign
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 text-muted-foreground border-2 border-dashed rounded-[3rem] bg-muted/5">
                <div className="max-w-xs mx-auto space-y-3">
                  <Activity className="h-10 w-10 mx-auto opacity-20" />
                  <p className="font-bold">Queue Empty</p>
                  <p className="text-xs">All pickups have been assigned to active collectors.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ManualAssignDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} request={selectedRequest} />
    </AppLayout>
  );
}
function Activity({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
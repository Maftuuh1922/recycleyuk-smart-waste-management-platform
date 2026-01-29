import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Request, RequestStatus } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle, Clock, ChevronLeft, MapPin, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
const STATUS_STEPS: { status: RequestStatus; label: string; desc: string }[] = [
  { status: 'PENDING', label: 'Requested', desc: 'Waiting for a collector' },
  { status: 'ACCEPTED', label: 'Accepted', desc: 'Collector assigned' },
  { status: 'ON_THE_WAY', label: 'OTW', desc: 'Collector is moving' },
  { status: 'ARRIVED', label: 'Arrived', desc: 'Collector at your location' },
  { status: 'COLLECTING', label: 'Collecting', desc: 'Pick up in progress' },
  { status: 'COMPLETED', label: 'Completed', desc: 'Waste removed' },
  { status: 'VALIDATED', label: 'Validated', desc: 'Confirmed by system' },
];
export default function RequestDetail() {
  const { id } = useParams();
  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => api<Request>(`/api/requests/${id}`),
    enabled: !!id,
    refetchInterval: 5000,
  });
  if (isLoading) return <AppLayout container><Skeleton className="h-[600px] w-full" /></AppLayout>;
  if (!request) return <AppLayout container>Request not found</AppLayout>;
  const currentIdx = STATUS_STEPS.findIndex(s => s.status === request.status);
  return (
    <AppLayout container>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" asChild className="-ml-4">
          <Link to="/dashboard"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">Request Detail</h1>
            <p className="text-muted-foreground">ID: {request.id}</p>
          </div>
          <Badge className="text-lg py-1 px-4" variant="outline">{request.status}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Pickup Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {STATUS_STEPS.map((step, idx) => {
                  const isPast = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2",
                          isPast ? "bg-emerald-600 border-emerald-600 text-white" : 
                          isCurrent ? "bg-emerald-100 border-emerald-600 text-emerald-600 animate-pulse" : 
                          "bg-muted border-muted text-muted-foreground"
                        )}>
                          {isPast ? <CheckCircle2 size={16} /> : isCurrent ? <Clock size={16} /> : <Circle size={16} />}
                        </div>
                        {idx !== STATUS_STEPS.length - 1 && (
                          <div className={cn("w-0.5 h-10 my-1", isPast ? "bg-emerald-600" : "bg-muted")} />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className={cn("font-bold", isCurrent ? "text-emerald-700" : "text-foreground")}>{step.label}</p>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                  <span>{request.location.address}</span>
                </div>
                <div className="pt-2 border-t text-sm">
                  <p className="text-muted-foreground">Waste Type</p>
                  <p className="font-bold">{request.wasteType}</p>
                </div>
                <div className="pt-2 border-t text-sm">
                  <p className="text-muted-foreground">Created At</p>
                  <p className="font-bold">{format(request.createdAt, 'PPP HH:mm')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {request.photos?.map((p, i) => (
                    <img key={i} src={p} className="w-full aspect-square object-cover rounded-md border" />
                  )) || <p className="text-xs text-muted-foreground">No photos</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>TPU Chat (Mock)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-48 bg-muted/30 rounded-lg p-4 flex flex-col justify-end">
              <div className="bg-emerald-600 text-white p-2 rounded-lg self-end max-w-[80%] text-sm">
                Halo, saya sudah dekat lokasi.
              </div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Type a message..." />
              <Button size="icon"><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
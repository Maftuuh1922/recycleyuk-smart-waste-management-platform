import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { MapDisplay } from '@/components/MapDisplay';
import { api } from '@/lib/api-client';
import { Request, TrackingUpdate } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Truck, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
export default function LiveTracking() {
  const { id } = useParams<{ id: string }>();
  const { data: request } = useQuery({
    queryKey: ['request', id],
    queryFn: () => api<Request>(`/api/requests/${id}`),
    enabled: !!id,
    refetchInterval: 10000,
  });
  const { data: tracking } = useQuery({
    queryKey: ['tracking', id],
    queryFn: () => api<TrackingUpdate[]>(`/api/requests/${id}/tracking`),
    enabled: !!id,
    refetchInterval: 5000,
  });
  const latestPos = tracking?.[tracking.length - 1];
  const collectorPos: [number, number] = latestPos ? [latestPos.lat, latestPos.lng] : [request?.location.lat || -6.2088, request?.location.lng || 106.8456];
  const destinationPos: [number, number] = [request?.location.lat || -6.2088, request?.location.lng || 106.8456];
  return (
    <AppLayout container>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Track Collection</h1>
            <p className="text-sm text-muted-foreground">Real-time location of your collector</p>
          </div>
          <Badge className="ml-auto bg-emerald-100 text-emerald-700 animate-pulse">Live</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 aspect-video lg:aspect-auto lg:h-[600px]">
            <MapDisplay 
              center={collectorPos}
              markers={[
                { position: collectorPos, label: 'Collector', type: 'COLLECTOR' },
                { position: destinationPos, label: 'Your Location', type: 'DESTINATION' }
              ]}
            />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-emerald-50 rounded-lg"><Truck className="h-4 w-4 text-emerald-600" /></div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{request?.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-blue-50 rounded-lg"><MapPin className="h-4 w-4 text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-medium">Destination</p>
                    <p className="text-xs text-muted-foreground">{request?.location.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-amber-50 rounded-lg"><Clock className="h-4 w-4 text-amber-600" /></div>
                  <div>
                    <p className="text-sm font-medium">Estimated Arrival</p>
                    <p className="text-xs text-muted-foreground">~ 8-12 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4 before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-muted">
                  <TimelineItem title="Request Accepted" time={request?.createdAt ? format(request.createdAt, 'HH:mm') : '--:--'} active />
                  <TimelineItem title="Collector OTW" time={request?.updatedAt ? format(request.updatedAt, 'HH:mm') : '--:--'} active={request?.status !== 'ACCEPTED'} />
                  <TimelineItem title="Arrived" time="Pending" active={request?.status === 'ARRIVED'} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
function TimelineItem({ title, time, active }: { title: string; time: string; active?: boolean }) {
  return (
    <div className={`relative pl-8 ${active ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
      <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 bg-background z-10 ${active ? 'border-emerald-500' : 'border-muted'}`} />
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs">{time}</p>
    </div>
  );
}
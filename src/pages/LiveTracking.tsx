import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { MapDisplay } from '@/components/MapDisplay';
import { api } from '@/lib/api-client';
import { Request } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Truck, MessageCircle, Phone, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export default function LiveTracking() {
  const { id } = useParams();
  const { data: request, isLoading } = useQuery({
    queryKey: ['request-track', id],
    queryFn: () => api<Request>(`/api/requests/${id}`),
    enabled: !!id,
    refetchInterval: 10000,
  });
  // Simulated moving collector
  const [collectorPos, setCollectorPos] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (request && !collectorPos) {
      // Start collector a bit away from destination
      setCollectorPos([request.location.lat + 0.005, request.location.lng + 0.005]);
    }
  }, [request]);
  useEffect(() => {
    if (collectorPos && request) {
      const interval = setInterval(() => {
        setCollectorPos(current => {
          if (!current) return null;
          const [lat, lng] = current;
          const targetLat = request.location.lat;
          const targetLng = request.location.lng;
          // Move 10% closer to target each step
          const nextLat = lat + (targetLat - lat) * 0.1;
          const nextLng = lng + (targetLng - lng) * 0.1;
          return [nextLat, nextLng];
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [collectorPos, request]);
  const markers = useMemo(() => {
    if (!request || !collectorPos) return [];
    return [
      {
        position: [request.location.lat, request.location.lng] as [number, number],
        label: "Your Home",
        type: 'DESTINATION' as const,
      },
      {
        position: collectorPos,
        label: "TPU Collector",
        type: 'COLLECTOR' as const,
      }
    ];
  }, [request, collectorPos]);
  if (isLoading) return <AppLayout container><Skeleton className="h-[600px] w-full rounded-2xl" /></AppLayout>;
  if (!request) return <AppLayout container>Request not found</AppLayout>;
  return (
    <AppLayout className="flex flex-col h-screen overflow-hidden">
      <div className="absolute top-16 left-4 z-[1000]">
        <Button variant="secondary" asChild className="shadow-lg backdrop-blur-sm bg-white/80">
          <Link to="/dashboard"><ChevronLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
      </div>
      <div className="flex-1 relative">
        <MapDisplay 
          center={collectorPos || [request.location.lat, request.location.lng]} 
          zoom={16}
          markers={markers}
          className="rounded-none border-none h-full"
        />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4">
          <Card className="shadow-2xl border-emerald-500 overflow-hidden">
            <div className="bg-emerald-600 px-4 py-2 text-white flex justify-between items-center text-sm font-medium">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> 
                Estimated arrival: 5 mins
              </span>
              <Badge variant="secondary" className="bg-white/20 text-white border-none">
                {request.status.replace('_', ' ')}
              </Badge>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Collector On The Way</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Approaching your location
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-full h-10 w-10" asChild>
                    <Link to={`/request/${request.id}`}>
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-3/4 animate-pulse" />
                </div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Collector Assigned</span>
                  <span>Destination Arriving</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
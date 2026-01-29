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
    refetchInterval: 5000,
  });
  const [collectorPos, setCollectorPos] = useState<[number, number] | null>(null);
  const [eta, setEta] = useState(12); // Simulated minutes
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (request && !collectorPos) {
      // Start collector slightly away
      setCollectorPos([request.location.lat + 0.008, request.location.lng + 0.008]);
    }
  }, [request, collectorPos]);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (collectorPos && request) {
      interval = setInterval(() => {
        setCollectorPos(current => {
          if (!current) return null;
          const [lat, lng] = current;
          const targetLat = request.location.lat;
          const targetLng = request.location.lng;
          const latDiff = targetLat - lat;
          const lngDiff = targetLng - lng;
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          // If close enough, stop
          if (distance < 0.00005) {
            setEta(0);
            setProgress(100);
            return [targetLat, targetLng];
          }
          // Smooth step
          const stepSize = 0.08;
          const nextLat = lat + latDiff * stepSize;
          const nextLng = lng + lngDiff * stepSize;
          // Update ETA and progress roughly based on distance
          const remainingDistance = Math.sqrt((targetLat - nextLat)**2 + (targetLng - nextLng)**2);
          const initialDistance = 0.0113; // Diagonal of 0.008 offset
          const currentProgress = Math.min(100, Math.max(0, (1 - (remainingDistance / initialDistance)) * 100));
          setProgress(currentProgress);
          setEta(Math.ceil(remainingDistance * 1000)); // Rough multiplier for minutes
          return [nextLat, nextLng];
        });
      }, 1000); // More frequent updates for smoothness
    }
    return () => {
      if (interval) clearInterval(interval);
    };
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
  if (!request) return <AppLayout container><div className="text-center py-20">Request not found</div></AppLayout>;
  return (
    <AppLayout className="flex flex-col h-screen overflow-hidden">
      <div className="absolute top-16 left-4 z-[1000]">
        <Button variant="secondary" asChild className="shadow-lg backdrop-blur-sm bg-white/80 border border-emerald-100">
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
          <Card className="shadow-2xl border-emerald-500 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-emerald-600 px-4 py-2.5 text-white flex justify-between items-center text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-pulse" />
                {eta > 0 ? `Estimated arrival: ~${eta} mins` : 'Arrived at destination'}
              </span>
              <Badge variant="secondary" className="bg-white/20 text-white border-none uppercase text-[10px] tracking-widest">
                {request.status.replace('_', ' ')}
              </Badge>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                    <Truck size={24} className={eta > 0 ? "animate-bounce" : ""} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none">
                      {eta > 0 ? 'Collector On The Way' : 'Collector Arrived'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-600" /> 
                      {request.location.address}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10 hover:bg-emerald-50">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 hover:bg-emerald-50" asChild>
                    <Link to={`/request/${request.id}`}>
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2.5 w-full bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span className="text-emerald-700">Trip Started</span>
                  <span className={progress >= 100 ? "text-emerald-700 font-black" : ""}>Arrived</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
import React from 'react';
import { Request, WasteType, RequestStatus } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Scale, Clock, Trash2, Leaf, AlertTriangle, Package, CheckCircle2, Truck, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface RequestCardProps {
  request: Request;
  children?: React.ReactNode;
}
export function RequestCard({ request, children }: RequestCardProps) {
  const wasteConfig: Record<WasteType, { label: string; color: string; icon: React.ElementType }> = {
    ORGANIC: { label: 'Organic', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Leaf },
    NON_ORGANIC: { label: 'Non-Organic', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Package },
    B3: { label: 'Hazardous (B3)', color: 'bg-red-50 text-red-700 border-red-100', icon: AlertTriangle },
    RESIDUE: { label: 'Residue', color: 'bg-zinc-50 text-zinc-700 border-zinc-200', icon: Trash2 },
  };
  const statusConfig: Record<RequestStatus, { label: string; color: string }> = {
    PENDING: { label: 'Waiting', color: 'bg-amber-100 text-amber-700' },
    ACCEPTED: { label: 'Accepted', color: 'bg-blue-100 text-blue-700' },
    ON_THE_WAY: { label: 'OTW', color: 'bg-indigo-100 text-indigo-700' },
    ARRIVED: { label: 'Arrived', color: 'bg-cyan-100 text-cyan-700' },
    COLLECTING: { label: 'Collecting', color: 'bg-emerald-100 text-emerald-700' },
    COMPLETED: { label: 'Finished', color: 'bg-green-100 text-green-700' },
    VALIDATED: { label: 'Verified', color: 'bg-emerald-600 text-white' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  };
  const waste = wasteConfig[request.wasteType];
  const status = statusConfig[request.status];
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-emerald-50 dark:border-emerald-950 rounded-2xl flex flex-col hover:-translate-y-1">
      <CardHeader className="pb-3 border-b bg-emerald-50/20 dark:bg-emerald-900/10">
        <div className="flex justify-between items-start">
          <Badge className={cn("rounded-full px-3 py-0.5 border font-bold text-[10px] uppercase tracking-wider flex gap-1.5 items-center", waste.color)} variant="outline">
            <waste.icon className="h-3 w-3" />
            {waste.label}
          </Badge>
          <Badge className={cn("rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest transition-colors", status.color)} variant="secondary">
            {request.status === 'VALIDATED' && <CheckCircle2 size={10} className="mr-1 inline" />}
            {status.label}
          </Badge>
        </div>
        <CardTitle className="text-lg font-bold mt-3 line-clamp-1 group-hover:text-emerald-700 transition-colors">
          {request.location.address}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-4 flex-1">
        <div className="flex items-start text-sm text-muted-foreground leading-snug">
          <MapPin className="h-4 w-4 mr-2 text-emerald-600 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{request.location.address}</span>
        </div>
        {request.collectorName && request.status !== 'PENDING' && (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 animate-in fade-in slide-in-from-left-1">
            <Truck size={14} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight">
              Assigned: {request.collectorName}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-sm font-bold bg-muted/30 px-2 py-1 rounded-md">
            <Scale className="h-3.5 w-3.5 mr-2 text-emerald-600" />
            <span>{request.weightEstimate} <span className="text-[10px] font-normal text-muted-foreground">kg</span></span>
          </div>
          <div className="flex items-center text-[10px] text-muted-foreground font-medium uppercase tracking-tighter bg-muted/10 px-2 py-1 rounded-md border">
            <Clock className="h-3 w-3 mr-1" />
            {format(request.createdAt, 'MMM d, HH:mm')}
          </div>
        </div>
      </CardContent>
      {children && (
        <CardFooter className="pt-0 pb-4 flex-col gap-2">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
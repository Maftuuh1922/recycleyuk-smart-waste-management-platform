import React from 'react';
import { Request, WasteType, RequestStatus } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Scale, Clock, Trash2, Leaf, AlertTriangle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface RequestCardProps {
  request: Request;
  children?: React.ReactNode;
}
export function RequestCard({ request, children }: RequestCardProps) {
  const wasteConfig: Record<WasteType, { label: string; color: string; icon: React.ElementType }> = {
    ORGANIC: { label: 'Organic', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Leaf },
    NON_ORGANIC: { label: 'Non-Organic', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
    B3: { label: 'Hazardous (B3)', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
    RESIDUE: { label: 'Residue', color: 'bg-zinc-100 text-zinc-700 border-zinc-200', icon: Trash2 },
  };
  const statusConfig: Record<RequestStatus, { label: string; color: string }> = {
    PENDING: { label: 'Waiting', color: 'bg-amber-100 text-amber-700' },
    ACCEPTED: { label: 'Accepted', color: 'bg-blue-100 text-blue-700' },
    ON_THE_WAY: { label: 'OTW', color: 'bg-indigo-100 text-indigo-700' },
    ARRIVED: { label: 'Arrived', color: 'bg-cyan-100 text-cyan-700' },
    COLLECTING: { label: 'Collecting', color: 'bg-emerald-100 text-emerald-700' },
    COMPLETED: { label: 'Finished', color: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  };
  const waste = wasteConfig[request.wasteType];
  const status = statusConfig[request.status];
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border-emerald-50 dark:border-emerald-950">
      <CardHeader className="pb-3 border-b bg-emerald-50/30 dark:bg-emerald-900/10">
        <div className="flex justify-between items-start">
          <Badge className={cn("rounded-full px-3 py-0.5 border font-medium flex gap-1.5 items-center", waste.color)} variant="outline">
            <waste.icon className="h-3 w-3" />
            {waste.label}
          </Badge>
          <Badge className={cn("rounded-md", status.color)} variant="secondary">
            {status.label}
          </Badge>
        </div>
        <CardTitle className="text-lg font-bold mt-3 line-clamp-1">{request.location.address}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
          <span className="truncate">{request.location.address}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Scale className="h-4 w-4 mr-2 text-emerald-600" />
            <span className="font-semibold">{request.weightEstimate} kg</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
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
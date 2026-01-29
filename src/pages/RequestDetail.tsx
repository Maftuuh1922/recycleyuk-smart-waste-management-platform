import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Request, RequestStatus } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Circle, Clock, ChevronLeft, MapPin, Send, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
const STATUS_STEPS: { status: RequestStatus; label: string; desc: string }[] = [
  { status: 'PENDING', label: 'Requested', desc: 'Waiting for a collector' },
  { status: 'ACCEPTED', label: 'Accepted', desc: 'Collector assigned' },
  { status: 'ON_THE_WAY', label: 'OTW', desc: 'Collector is moving' },
  { status: 'ARRIVED', label: 'Arrived', desc: 'Collector at your location' },
  { status: 'COLLECTING', label: 'Collecting', desc: 'Pick up in progress' },
  { status: 'COMPLETED', label: 'Completed', desc: 'Waste removed' },
];
export default function RequestDetail() {
  const { id } = useParams();
  const [chatInput, setChatInput] = useState('');
  const [mockMessages, setMockMessages] = useState([
    { role: 'COLLECTOR', text: 'Halo, saya sudah dekat lokasi. Tolong sampahnya ditaruh di depan ya.', time: '10:05' }
  ]);
  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => api<Request>(`/api/requests/${id}`),
    enabled: !!id,
    refetchInterval: 3000, // Near-realtime status tracking
  });
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMockMessages([...mockMessages, { role: 'RESIDENT', text: chatInput, time: format(new Date(), 'HH:mm') }]);
    setChatInput('');
  };
  if (isLoading) return <AppLayout container><Skeleton className="h-[600px] w-full rounded-2xl" /></AppLayout>;
  if (!request) return <AppLayout container><div className="text-center py-20">Request not found</div></AppLayout>;
  const currentIdx = STATUS_STEPS.findIndex(s => s.status === request.status);
  const isCancelled = request.status === 'CANCELLED';
  return (
    <AppLayout container>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-emerald-50">
            <Link to="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight">Request Timeline</h1>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">ID: {request.id.slice(0, 8)}</p>
          </div>
          <Badge className={cn("ml-auto px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] border-none",
            isCancelled ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
          )} variant="secondary">
            {request.status.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm rounded-2xl border-emerald-50 overflow-hidden">
            <CardHeader className="border-b bg-muted/5">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" /> Collection Status
                </span>
                {!isCancelled && request.status !== 'COMPLETED' && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                    <Loader2 size={10} className="animate-spin" /> POLLING REALTIME
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              {isCancelled ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <ChevronLeft className="rotate-45" size={32} />
                  </div>
                  <p className="text-muted-foreground font-medium italic">This request has been cancelled by the user or system.</p>
                </div>
              ) : (
                <div className="space-y-10 relative px-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const isPast = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step.status} className="flex gap-6 group relative">
                        <div className="flex flex-col items-center z-10">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-700",
                            isPast ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20" :
                            isCurrent ? "bg-white border-emerald-600 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110" :
                            "bg-muted border-muted text-muted-foreground opacity-40"
                          )}>
                            {isPast ? <CheckCircle2 size={20} /> : isCurrent ? <Clock size={20} className="animate-spin-slow" /> : <Circle size={18} />}
                          </div>
                          {idx !== STATUS_STEPS.length - 1 && (
                            <div className={cn("w-0.5 h-14 my-1 transition-all duration-1000", isPast ? "bg-emerald-600" : "bg-muted")} />
                          )}
                        </div>
                        <div className={cn("pt-1 transition-all duration-500", !isPast && !isCurrent && "opacity-40 grayscale")}>
                          <p className={cn("font-bold text-lg leading-tight", isCurrent ? "text-emerald-700" : "text-foreground")}>
                            {step.label}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                          {isCurrent && (
                            <Badge variant="outline" className="mt-2 text-[9px] bg-emerald-50 text-emerald-700 border-emerald-100">
                              CURRENT STATUS
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="shadow-sm rounded-2xl overflow-hidden border-emerald-50">
              <CardHeader className="border-b bg-muted/5">
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Waste Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{request.location.address}</p>
                    <p className="text-[10px] text-muted-foreground">GPS: {request.location.lat.toFixed(4)}, {request.location.lng.toFixed(4)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-dashed">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] mb-1">Type</p>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold">
                      {request.wasteType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] mb-1">Estimate</p>
                    <p className="font-bold text-lg">{request.weightEstimate} <span className="text-xs text-muted-foreground font-medium">kg</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm rounded-2xl overflow-hidden border-emerald-50 flex flex-col h-[400px]">
              <CardHeader className="border-b p-4 bg-muted/5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" /> Collector Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 bg-muted/10 p-4 overflow-y-auto space-y-4 flex flex-col">
                  {mockMessages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === 'RESIDENT' ? "self-end flex-row-reverse" : "self-start")}>
                      <Avatar className="h-7 w-7 shrink-0 shadow-sm">
                        <AvatarFallback className={cn("text-[10px] font-bold", msg.role === 'RESIDENT' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white')}>
                          {msg.role === 'RESIDENT' ? 'YOU' : 'TPU'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("p-3 rounded-2xl text-sm shadow-sm transition-all duration-300",
                        msg.role === 'RESIDENT' ? "bg-emerald-600 text-white rounded-tr-none animate-in slide-in-from-right-2" : "bg-white border rounded-tl-none animate-in slide-in-from-left-2")}>
                        {msg.text}
                        <p className={cn("text-[9px] mt-1 text-right font-medium", msg.role === 'RESIDENT' ? "text-white/60" : "text-muted-foreground/60")}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2">
                  <Input
                    placeholder="Message..."
                    className="rounded-full bg-muted/50 border-none h-10 px-4 focus-visible:ring-emerald-500"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <Button size="icon" className="rounded-full shrink-0 h-10 w-10 bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-95 transition-all">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
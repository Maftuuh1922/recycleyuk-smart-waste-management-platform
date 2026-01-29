import React, { useState, useEffect, useRef } from 'react';
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
import { CheckCircle2, Circle, Clock, ChevronLeft, MapPin, Send, MessageSquare, Loader2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [mockMessages, setMockMessages] = useState([
    { role: 'COLLECTOR', text: 'Halo, saya sudah dekat lokasi. Tolong sampahnya ditaruh di depan ya.', time: '10:05' }
  ]);
  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => api<Request>(`/api/requests/${id}`),
    enabled: !!id,
    refetchInterval: 2000,
  });
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mockMessages]);
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMockMessages([...mockMessages, { role: 'RESIDENT', text: chatInput, time: format(new Date(), 'HH:mm') }]);
    setChatInput('');
  };
  const handleCall = () => {
    toast(`Dialing...`, {
      description: `Connecting you to ${request?.collectorName || 'Collector'} (${request?.collectorPhone || 'Private'})`,
      icon: <Phone className="h-4 w-4" />
    });
  };
  if (isLoading) return <AppLayout container><Skeleton className="h-[600px] w-full rounded-3xl" /></AppLayout>;
  if (!request) return <AppLayout container><div className="text-center py-20 font-bold">Request not found</div></AppLayout>;
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
            <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">ID: {request.id.slice(0, 8)}</p>
          </div>
          <Badge className={cn("ml-auto px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] font-black border-none",
            isCancelled ? "bg-red-100 text-red-700" : "bg-emerald-600 text-white"
          )} variant="secondary">
            {request.status.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm rounded-3xl border-emerald-50 overflow-hidden">
            <CardHeader className="border-b bg-muted/5 p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" /> Active Progress
                </span>
                {!isCancelled && request.status !== 'COMPLETED' && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 animate-pulse">
                    <Loader2 size={12} className="animate-spin" /> LIVE
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 pb-12">
              {isCancelled ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border-2 border-red-100">
                    <Circle size={40} className="rotate-45" />
                  </div>
                  <p className="text-muted-foreground font-bold italic">Request has been cancelled.</p>
                </div>
              ) : (
                <div className="space-y-12 relative px-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const isPast = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step.status} className="flex gap-8 group relative">
                        <div className="flex flex-col items-center z-10 shrink-0">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-700",
                            isPast ? "bg-emerald-600 border-emerald-50 text-white shadow-lg shadow-emerald-500/10" :
                            isCurrent ? "bg-white border-emerald-600 text-emerald-600 shadow-xl scale-110" :
                            "bg-muted border-muted/50 text-muted-foreground opacity-40"
                          )}>
                            {isPast ? <CheckCircle2 size={24} /> : isCurrent ? <Clock size={24} className="animate-spin-slow" /> : <Circle size={20} />}
                          </div>
                          {idx !== STATUS_STEPS.length - 1 && (
                            <div className={cn("w-1 h-14 my-1 transition-all duration-1000", isPast ? "bg-emerald-600" : "bg-muted")} />
                          )}
                        </div>
                        <div className={cn("pt-1.5 transition-all duration-500", !isPast && !isCurrent && "opacity-40 grayscale")}>
                          <p className={cn("font-black text-lg uppercase tracking-tight", isCurrent ? "text-emerald-700" : "text-foreground")}>
                            {step.label}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1.5 font-medium leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            {request.collectorName && (
              <Card className="shadow-lg border-emerald-100 bg-emerald-50/10 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="p-5 border-b border-emerald-50">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">Your Collector</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-4 border-emerald-100 shadow-sm">
                      <AvatarFallback className="bg-emerald-600 text-white font-black text-xl">
                        {(request.collectorName || 'T')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-black text-xl leading-none">{request.collectorName}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1.5">ID: {request.collectorId?.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50" onClick={handleCall}>
                      <Phone size={16} className="mr-2" /> Call
                    </Button>
                    <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50" asChild>
                      <a href={`tel:${request.collectorPhone}`}><MessageSquare size={16} className="mr-2" /> SMS</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="rounded-3xl border-emerald-50 overflow-hidden shadow-sm flex flex-col h-[400px]">
              <CardHeader className="border-b p-5 bg-muted/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" /> Dispatch Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 bg-muted/5 p-5 overflow-y-auto space-y-4">
                  {mockMessages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === 'RESIDENT' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                      <div className={cn("p-4 rounded-2xl text-sm shadow-sm font-medium", 
                        msg.role === 'RESIDENT' ? "bg-emerald-600 text-white rounded-tr-none" : "bg-white border rounded-tl-none")}>
                        {msg.text}
                        <p className={cn("text-[9px] mt-2 font-black tracking-widest uppercase opacity-60", 
                          msg.role === 'RESIDENT' ? "text-right" : "text-left")}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-background flex gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    className="rounded-xl bg-muted/30 border-none h-11 px-4 font-medium" 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                  />
                  <Button size="icon" className="rounded-xl h-11 w-11 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 shrink-0">
                    <Send size={18} />
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
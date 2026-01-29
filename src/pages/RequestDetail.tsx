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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Circle, Clock, ChevronLeft, MapPin, Send, MessageSquare } from 'lucide-react';
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
    refetchInterval: 5000,
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
  return (
    <AppLayout container>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Request Detail</h1>
            <p className="text-sm text-muted-foreground font-mono">#{request.id.slice(0, 8)}</p>
          </div>
          <Badge className="ml-auto px-4 py-1 rounded-full uppercase tracking-widest text-[10px]" variant="secondary">
            {request.status}
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" /> Pickup Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {STATUS_STEPS.map((step, idx) => {
                  const isPast = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.status} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                          isPast ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20" :
                          isCurrent ? "bg-emerald-50 border-emerald-600 text-emerald-600 animate-pulse" :
                          "bg-muted border-muted text-muted-foreground opacity-50"
                        )}>
                          {isPast ? <CheckCircle2 size={20} /> : isCurrent ? <Clock size={20} /> : <Circle size={20} />}
                        </div>
                        {idx !== STATUS_STEPS.length - 1 && (
                          <div className={cn("w-0.5 h-12 my-2 transition-colors duration-500", isPast ? "bg-emerald-600" : "bg-muted")} />
                        )}
                      </div>
                      <div className={cn("pt-1 transition-opacity", !isPast && !isCurrent && "opacity-50")}>
                        <p className={cn("font-bold text-lg", isCurrent ? "text-emerald-700" : "text-foreground")}>{step.label}</p>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="border-b"><CardTitle className="text-base">Waste Information</CardTitle></CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-3 text-emerald-600 shrink-0" />
                  <span className="font-medium">{request.location.address}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Type</p>
                    <p className="font-bold text-emerald-700">{request.wasteType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Weight</p>
                    <p className="font-bold">{request.weightEstimate} kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="border-b p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> TPU Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 bg-muted/10 p-4 overflow-y-auto space-y-4 flex flex-col">
                  {mockMessages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === 'RESIDENT' ? "self-end flex-row-reverse" : "self-start")}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={msg.role === 'RESIDENT' ? 'bg-blue-100' : 'bg-emerald-100'}>
                          {msg.role === 'RESIDENT' ? 'W' : 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("p-3 rounded-2xl text-sm shadow-sm", 
                        msg.role === 'RESIDENT' ? "bg-emerald-600 text-white rounded-tr-none" : "bg-white border rounded-tl-none")}>
                        {msg.text}
                        <p className={cn("text-[10px] mt-1 text-right", msg.role === 'RESIDENT' ? "text-white/70" : "text-muted-foreground")}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
                  <Input 
                    placeholder="Message collector..." 
                    className="rounded-full bg-muted border-none h-10 px-4" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <Button size="icon" className="rounded-full shrink-0 h-10 w-10 bg-emerald-600">
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
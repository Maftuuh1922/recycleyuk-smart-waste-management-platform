import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Recycle, Users, Activity, TrendingUp } from 'lucide-react';
import { User, Request } from '@shared/types';
import { MapDisplay } from '@/components/MapDisplay';
export default function AdminDashboard() {
  const { data: usersData = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<User[]>('/api/users/list'),
  });
  const { data: requests = [] } = useQuery({
    queryKey: ['all-requests-admin'],
    queryFn: () => api<Request[]>('/api/requests?role=ADMIN'),
  });
  const totalWeight = useMemo(() =>
    requests.reduce((sum, r) => sum + (r.weightEstimate || 0), 0).toFixed(1),
  [requests]);
  const mapMarkers = requests.map(req => ({
    position: [req.location.lat, req.location.lng] as [number, number],
    label: req.location.address,
    wasteType: req.wasteType
  }));
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of community waste logistics and environmental health.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Residents" value={usersData.filter(u => u.role === 'WARGA').length.toString()} delta="+4.2%" icon={<Users className="text-blue-500" />} />
          <StatCard title="Pickups Completed" value={requests.filter(r => r.status === 'COMPLETED').length.toString()} delta="+12%" icon={<Recycle className="text-emerald-500" />} />
          <StatCard title="TPU Fleet Active" value={usersData.filter(u => u.role === 'TPU' && u.isOnline).length.toString()} delta="Live" icon={<Activity className="text-amber-500" />} />
          <StatCard title="Total Mass Diverted" value={`${totalWeight} kg`} delta="+8.5%" icon={<TrendingUp className="text-purple-500" />} />
        </div>
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">Live Activity Map</h2>
          <div className="h-[500px] w-full rounded-3xl overflow-hidden border shadow-sm">
            <MapDisplay 
              center={[-6.2247, 106.8077]} 
              zoom={14} 
              markers={mapMarkers}
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
function StatCard({ title, value, delta, icon }: { title: string; value: string; delta: string; icon: React.ReactNode }) {
  return (
    <Card className="rounded-3xl border shadow-sm hover:shadow-md transition-all">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-muted/50 rounded-2xl">{icon}</div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">{delta}</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        <p className="text-3xl font-black mt-1 tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
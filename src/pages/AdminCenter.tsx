import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Recycle, Users, Activity, TrendingUp } from 'lucide-react';
export default function AdminCenter() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api<any>('/api/admin/stats'),
  });
  const wasteData = stats?.wasteDistribution || [
    { name: 'Organic', value: 400 },
    { name: 'Non-Organic', value: 300 },
    { name: 'Hazardous', value: 100 },
    { name: 'Residue', value: 200 },
  ];
  const weeklyData = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 19 },
    { day: 'Wed', count: 15 },
    { day: 'Thu', count: 22 },
    { day: 'Fri', count: 30 },
    { day: 'Sat', count: 28 },
    { day: 'Sun', count: 10 },
  ];
  const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#71717a'];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Community Command Center</h1>
          <p className="text-muted-foreground">Monitoring environmental impact for RW 04.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value="248" delta="+12%" icon={<Users className="text-blue-500" />} />
          <StatCard title="Total Pickups" value="1,240" delta="+5%" icon={<Recycle className="text-emerald-500" />} />
          <StatCard title="Active TPU" value="8" delta="Stable" icon={<Activity className="text-amber-500" />} />
          <StatCard title="Total Weight" value="4.2 Tons" delta="+8%" icon={<TrendingUp className="text-purple-500" />} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Waste Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {wasteData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4 text-xs font-medium">
                {wasteData.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pickup Activity (Weekly)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f4f4f5' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
function StatCard({ title, value, delta, icon }: { title: string; value: string; delta: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{delta}</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
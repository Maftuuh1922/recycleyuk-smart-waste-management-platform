import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function AdminReports() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api<any>('/api/admin/stats'),
  });
  const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#71717a'];
  const wasteData = stats?.wasteDistribution || [];
  const weeklyData = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 19 },
    { day: 'Wed', count: 15 },
    { day: 'Thu', count: 22 },
    { day: 'Fri', count: 30 },
    { day: 'Sat', count: 25 },
    { day: 'Sun', count: 18 },
  ];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Deep dive into community waste patterns and logistics performance.</p>
          </div>
          <Button variant="outline" className="rounded-full h-11 px-6 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white dark:bg-zinc-950">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                  <FileText size={18} />
                </div>
                Waste Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] pt-8">
              {wasteData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={wasteData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                      {wasteData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>}
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                {wasteData.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs font-bold uppercase tracking-widest">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white dark:bg-zinc-950">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <BarChart3 size={18} />
                </div>
                Weekly Pickup Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white dark:bg-zinc-950">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b">
              <CardTitle className="text-lg">Daily Request Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
function BarChart3({ className, size }: { className?: string, size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20V14" />
    </svg>
  );
}
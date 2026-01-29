import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Recycle, Users, Activity, TrendingUp, Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from '@shared/types';
export default function AdminCenter() {
  const [search, setSearch] = useState('');
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api<any>('/api/admin/stats'),
  });
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<User[]>('/api/users/list'),
    initialData: [] as User[]
  });
  const wasteData = stats?.wasteDistribution || [
    { name: 'Organic', value: 0 },
    { name: 'Non-Organic', value: 0 },
    { name: 'Hazardous', value: 0 },
    { name: 'Residue', value: 0 },
  ];
  const weeklyData = [
    { day: 'Mon', count: 12 }, { day: 'Tue', count: 19 }, { day: 'Wed', count: 15 },
    { day: 'Thu', count: 22 }, { day: 'Fri', count: 30 }, { day: 'Sat', count: 28 }, { day: 'Sun', count: 10 },
  ];
  const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#71717a'];
  const filteredUsers = usersData.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Community Command Center</h1>
          <p className="text-muted-foreground">Monitoring environmental impact for RW 04.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={usersData.length.toString()} delta="+12%" icon={<Users className="text-blue-500" />} />
          <StatCard title="Total Pickups" value={stats?.totalCount?.toString() || "0"} delta="+5%" icon={<Recycle className="text-emerald-500" />} />
          <StatCard title="Active TPU" value={stats?.onlineCollectors?.toString() || "0"} delta="Stable" icon={<Activity className="text-amber-500" />} />
          <StatCard title="Total Weight" value="4.2 Tons" delta="+8%" icon={<TrendingUp className="text-purple-500" />} />
        </div>
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList>
            <TabsTrigger value="analytics">Analytics Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Waste Type Distribution</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={wasteData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {wasteData.map((_: any, index: number) => (
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
                <CardHeader><CardTitle>Pickup Activity (Weekly)</CardTitle></CardHeader>
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
          </TabsContent>
          <TabsContent value="users" className="pt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">Community Members</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left font-medium">
                        <th className="p-4 whitespace-nowrap">Name</th>
                        <th className="p-4 whitespace-nowrap">Role</th>
                        <th className="p-4 whitespace-nowrap">Status</th>
                        <th className="p-4 whitespace-nowrap">Address</th>
                        <th className="p-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                            <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                            <td className="p-4"><Skeleton className="h-8 w-8 rounded-full" /></td>
                          </tr>
                        ))
                      ) : filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4">
                            <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'TPU' ? 'secondary' : 'outline'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <div className={`h-2 w-2 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                              <span className="text-xs">{user.isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground truncate max-w-[200px]">{user.address || 'N/A'}</td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
import React, { useState, useMemo } from 'react';
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
import { Recycle, Users, Activity, TrendingUp, Search, MoreVertical, UserPlus, Truck, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Request } from '@shared/types';
import { AdminUserDialog } from '@/components/AdminUserDialog';
import { ManualAssignDialog } from '@/components/ManualAssignDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export default function AdminCenter() {
  const [search, setSearch] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api<any>('/api/admin/stats'),
  });
  const { data: usersData = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<User[]>('/api/users/list'),
  });
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['all-requests-admin'],
    queryFn: () => api<Request[]>('/api/requests?role=ADMIN'),
  });
  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'PENDING'), [requests]);
  const totalWeight = useMemo(() => 
    requests.reduce((sum, r) => sum + (r.weightEstimate || 0), 0).toFixed(1),
  [requests]);
  const filteredUsers = useMemo(() => 
    usersData.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    ),
  [usersData, search]);
  const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#71717a'];
  const wasteData = stats?.wasteDistribution || [];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
            <p className="text-muted-foreground mt-1">Monitoring environmental impact for RW 04 Community.</p>
          </div>
          <Button onClick={() => { setSelectedUser(null); setUserDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 rounded-full h-11 px-6 shadow-lg shadow-emerald-500/20">
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={usersData.length.toString()} delta="+12%" icon={<Users className="text-blue-500" />} />
          <StatCard title="Total Pickups" value={requests.length.toString()} delta="+5%" icon={<Recycle className="text-emerald-500" />} />
          <StatCard title="Active TPU" value={usersData.filter(u => u.role === 'TPU' && u.isOnline).length.toString()} delta="Live" icon={<Activity className="text-amber-500" />} />
          <StatCard title="Total Mass" value={`${totalWeight} kg`} delta="+8%" icon={<TrendingUp className="text-purple-500" />} />
        </div>
        <Tabs defaultValue="ops" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-11">
            <TabsTrigger value="ops" className="rounded-lg px-6">Pending ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg px-6">Analytics</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg px-6">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="ops" className="pt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Unassigned Requests</h2>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100">Action Required</Badge>
            </div>
            {requestsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-36 rounded-xl" /><Skeleton className="h-36 rounded-xl" /><Skeleton className="h-36 rounded-xl" />
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map(req => (
                  <Card key={req.id} className="border-emerald-100 hover:shadow-md transition-shadow group">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px] font-black">{req.wasteType}</Badge>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">PENDING</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm font-semibold text-foreground/80">
                        <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{req.location.address}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 h-10 rounded-lg group-hover:scale-[1.02] transition-transform"
                        onClick={() => { setSelectedRequest(req); setAssignDialogOpen(true); }}
                      >
                        <Truck className="mr-2 h-3.5 w-3.5" /> Manual Assign
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/5">
                <p className="font-medium italic">All quiet! No pending requests at the moment.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-2xl">
                <CardHeader><CardTitle className="text-lg">Waste Distribution</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  {wasteData.length > 0 ? (
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
                  ) : <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>}
                  <div className="flex flex-wrap justify-center gap-4 mt-4 text-[10px] font-black uppercase">
                    {wasteData.map((d: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        {d.name}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader><CardTitle className="text-lg">Growth Performance</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{day: 'Mon', count: 12}, {day: 'Tue', count: 19}, {day: 'Wed', count: 15}, {day: 'Thu', count: 22}, {day: 'Fri', count: 30}]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="users" className="pt-6">
            <Card className="rounded-2xl border-none shadow-none bg-transparent">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" /> Member Directory
                </h2>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search name, role, address..." className="pl-10 h-11 rounded-xl bg-background border-emerald-100" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="rounded-2xl border bg-background overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                        <th className="p-4">Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Address</th>
                        <th className="p-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {usersLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}><td colSpan={5} className="p-4"><Skeleton className="h-6 w-full rounded" /></td></tr>
                        ))
                      ) : filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 font-bold">{user.name}</td>
                          <td className="p-4">
                            <Badge variant="outline" className={user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : user.role === 'TPU' ? 'bg-blue-50 text-blue-700' : 'bg-zinc-50 text-zinc-700'}>{user.role}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`h-2.5 w-2.5 rounded-full ${user.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                              <span className="text-xs font-medium">{user.isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground truncate max-w-[200px]">{user.address || '—'}</td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                <DropdownMenuItem className="font-medium" onClick={() => { setSelectedUser(user); setUserDialogOpen(true); }}>Edit Profile</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive font-medium">Deactivate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )) : (<tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">No matches found.</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <AdminUserDialog open={userDialogOpen} onOpenChange={setUserDialogOpen} user={selectedUser} />
      <ManualAssignDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} request={selectedRequest} />
    </AppLayout>
  );
}
function StatCard({ title, value, delta, icon }: { title: string; value: string; delta: string; icon: React.ReactNode }) {
  return (
    <Card className="rounded-3xl border-emerald-50 shadow-sm hover:shadow-md transition-shadow">
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
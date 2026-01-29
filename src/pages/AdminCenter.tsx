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
import { Recycle, Users, Activity, TrendingUp, Search, MoreVertical, Plus, UserPlus, Truck, MapPin } from 'lucide-react';
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
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const filteredUsers = usersData.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );
  const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#71717a'];
  const wasteData = stats?.wasteDistribution || [];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Community Command Center</h1>
            <p className="text-muted-foreground">Monitoring environmental impact for RW 04.</p>
          </div>
          <Button onClick={() => { setSelectedUser(null); setUserDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={usersData.length.toString()} delta="+12%" icon={<Users className="text-blue-500" />} />
          <StatCard title="Total Pickups" value={stats?.totalCount?.toString() || "0"} delta="+5%" icon={<Recycle className="text-emerald-500" />} />
          <StatCard title="Active TPU" value={stats?.onlineCollectors?.toString() || "0"} delta="Stable" icon={<Activity className="text-amber-500" />} />
          <StatCard title="Total Weight" value="4.2 Tons" delta="+8%" icon={<TrendingUp className="text-purple-500" />} />
        </div>
        <Tabs defaultValue="ops" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="ops" className="rounded-lg">Pending Operations ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg">User Management</TabsTrigger>
          </TabsList>
          <TabsContent value="ops" className="pt-6 space-y-4">
            <h2 className="text-lg font-bold">Unassigned Requests</h2>
            {requestsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-32 rounded-xl" /></div>
            ) : pendingRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map(req => (
                  <Card key={req.id} className="border-emerald-100 hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">{req.wasteType}</Badge>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Pending</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm font-medium">
                        <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{req.location.address}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-full text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        onClick={() => { setSelectedRequest(req); setAssignDialogOpen(true); }}
                      >
                        <Truck className="mr-2 h-3 w-3" /> Manual Assign
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground italic border rounded-xl bg-muted/5">
                No pending requests requiring manual assignment.
              </div>
            )}
          </TabsContent>
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
                <CardHeader><CardTitle>Weekly Performance</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{day: 'Mon', count: 12}, {day: 'Tue', count: 19}, {day: 'Wed', count: 15}, {day: 'Thu', count: 22}, {day: 'Fri', count: 30}]}>
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
                  <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                          <tr key={i} className="border-b"><td colSpan={5} className="p-4"><Skeleton className="h-4 w-full" /></td></tr>
                        ))
                      ) : filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4">
                            <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'TPU' ? 'secondary' : 'outline'}>{user.role}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <div className={`h-2 w-2 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                              <span className="text-xs">{user.isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground truncate max-w-[200px]">{user.address || 'N/A'}</td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedUser(user); setUserDialogOpen(true); }}>Edit User</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )) : (<tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No users found.</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </CardContent>
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
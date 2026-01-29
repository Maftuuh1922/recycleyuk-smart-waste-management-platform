import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, MoreVertical, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from '@shared/types';
import { AdminUserDialog } from '@/components/AdminUserDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: usersData = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<User[]>('/api/users/list'),
  });
  const filteredUsers = useMemo(() =>
    usersData.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      (u.address && u.address.toLowerCase().includes(search.toLowerCase()))
    ),
  [usersData, search]);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Member Management</h1>
            <p className="text-muted-foreground mt-1">Manage residents, collectors, and community managers.</p>
          </div>
          <Button onClick={() => { setSelectedUser(null); setUserDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 rounded-full h-11 px-6 shadow-lg shadow-emerald-500/20">
            <UserPlus className="mr-2 h-4 w-4" /> Add New Member
          </Button>
        </header>
        <Card className="rounded-3xl border p-6 bg-card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" /> Member Directory
            </h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search name, role, address..." 
                className="pl-10 h-11 rounded-xl bg-background border-emerald-100" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
          <div className="rounded-2xl border bg-background overflow-hidden shadow-sm">
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
                    <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-bold">{user.name}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={
                          user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                          user.role === 'TPU' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          'bg-zinc-50 text-zinc-700 border-zinc-100'
                        }>{user.role}</Badge>
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
                  )) : (<tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">No matches found for your search.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
      <AdminUserDialog open={userDialogOpen} onOpenChange={setUserDialogOpen} user={selectedUser} />
    </AppLayout>
  );
}
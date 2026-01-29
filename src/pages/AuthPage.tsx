import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck, ShieldCheck, Recycle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { MOCK_USERS } from '@shared/mock-data';
import { toast } from 'sonner';
export function AuthPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const handleLogin = (role: 'WARGA' | 'TPU' | 'ADMIN') => {
    const mockUser = MOCK_USERS.find(u => u.role === role);
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      toast.success(`Logged in as ${mockUser.name}`);
      if (role === 'WARGA') navigate('/dashboard');
      else if (role === 'TPU') navigate('/workspace');
      else navigate('/admin');
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-emerald-600">
        <Recycle className="w-8 h-8" />
        <span>RecycleYuk</span>
      </div>
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard 
          icon={<User className="w-10 h-10" />}
          title="Resident"
          role="WARGA"
          description="Book pickups and track waste collection for your household."
          onClick={() => handleLogin('WARGA')}
        />
        <RoleCard 
          icon={<Truck className="w-10 h-10" />}
          title="TPU Collector"
          role="TPU"
          description="Manage routes, accept jobs, and update pickup progress."
          onClick={() => handleLogin('TPU')}
        />
        <RoleCard 
          icon={<ShieldCheck className="w-10 h-10" />}
          title="RW Manager"
          role="ADMIN"
          description="Monitor community performance and system analytics."
          onClick={() => handleLogin('ADMIN')}
        />
      </div>
      <p className="mt-8 text-muted-foreground text-sm">
        Select a role to enter the mock platform simulation.
      </p>
    </div>
  );
}
function RoleCard({ icon, title, description, role, onClick }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  role: string;
  onClick: () => void; 
}) {
  return (
    <Card className="hover:border-emerald-500 transition-colors cursor-pointer group" onClick={onClick}>
      <CardHeader className="text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button variant="outline" className="w-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          Login as {title}
        </Button>
      </CardContent>
    </Card>
  );
}
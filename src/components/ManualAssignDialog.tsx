import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User, Request } from '@shared/types';
import { toast } from 'sonner';
import { Truck, AlertCircle } from 'lucide-react';
interface ManualAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: Request | null;
}
export function ManualAssignDialog({ open, onOpenChange, request }: ManualAssignDialogProps) {
  const queryClient = useQueryClient();
  const [selectedTpuId, setSelectedTpuId] = useState<string>('');
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<User[]>('/api/users/list'),
  });
  const { data: allRequests = [] } = useQuery({
    queryKey: ['all-requests-admin'],
    queryFn: () => api<Request[]>('/api/requests?role=ADMIN'),
  });
  const onlineTpus = users.filter(u => u.role === 'TPU' && u.isOnline);
  const getTpuLoad = (id: string) => {
    return allRequests.filter(r => r.collectorId === id && r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  };
  const assignMutation = useMutation({
    mutationFn: (collectorId: string) => api(`/api/requests/${request?.id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ collectorId })
    }),
    onSuccess: () => {
      toast.success("Collector assigned successfully");
      queryClient.invalidateQueries({ queryKey: ['all-requests-admin'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      onOpenChange(false);
    }
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Collector</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="bg-muted/30 p-3 rounded-lg border text-sm">
            <p className="font-bold text-emerald-700">{request?.wasteType} Pickup</p>
            <p className="text-muted-foreground">{request?.location.address}</p>
          </div>
          {onlineTpus.length === 0 ? (
            <div className="flex items-center gap-2 p-3 text-amber-700 bg-amber-50 rounded-lg border border-amber-100">
              <AlertCircle size={16} />
              <span className="text-xs">No collectors currently online.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Online TPU</label>
              <Select onValueChange={setSelectedTpuId} value={selectedTpuId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a collector..." />
                </SelectTrigger>
                <SelectContent>
                  {onlineTpus.map(tpu => (
                    <SelectItem key={tpu.id} value={tpu.id}>
                      <div className="flex justify-between w-full gap-8">
                        <span>{tpu.name}</span>
                        <span className="text-[10px] bg-muted px-1.5 rounded">Load: {getTpuLoad(tpu.id)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            disabled={!selectedTpuId || assignMutation.isPending} 
            onClick={() => assignMutation.mutate(selectedTpuId)}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Truck className="mr-2 h-4 w-4" /> Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
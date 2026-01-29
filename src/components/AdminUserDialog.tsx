import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, UserRole } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
const formSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  role: z.enum(['WARGA', 'TPU', 'ADMIN'] as const),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  isOnline: z.boolean().default(false),
});
type FormValues = z.infer<typeof formSchema>;
interface AdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}
export function AdminUserDialog({ open, onOpenChange, user }: AdminUserDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      role: 'WARGA',
      phone: '',
      address: '',
      isOnline: false,
    },
  });
  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          id: user.id,
          name: user.name,
          role: user.role,
          phone: user.phone || '',
          address: user.address || '',
          isOnline: !!user.isOnline,
        });
      } else {
        form.reset({
          id: `user-${Math.floor(Math.random() * 10000)}`,
          name: '',
          role: 'WARGA',
          phone: '',
          address: '',
          isOnline: false,
        });
      }
    }
  }, [user, form, open]);
  const onSubmit = async (values: FormValues) => {
    try {
      const method = user ? 'PATCH' : 'POST';
      const url = user ? `/api/users/${user.id}` : `/api/users`;
      await api(url, {
        method,
        body: JSON.stringify(values),
      });
      toast.success(user ? "User updated" : "User created");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save user");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit Member' : 'Add New Member'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="id" render={({ field }) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl><Input {...field} disabled={!!user} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="WARGA">Resident</SelectItem>
                      <SelectItem value="TPU">Collector</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="081..." {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Input placeholder="Blok X No. Y" {...field} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="isOnline" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel className="text-sm font-medium">Online Status</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
const formSchema = z.object({
  wasteType: z.enum(['ORGANIC', 'NON_ORGANIC', 'B3', 'RESIDUE']),
  weightEstimate: z.string().transform((v) => parseFloat(v)).pipe(z.number().positive()),
  address: z.string().min(5),
});
interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
export function NewRequestDialog({ open, onOpenChange, onSuccess }: NewRequestDialogProps) {
  const user = useAuthStore(s => s.user);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wasteType: 'ORGANIC',
      weightEstimate: 1 as any,
      address: user?.address || '',
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await api('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          wasteType: values.wasteType,
          weightEstimate: values.weightEstimate,
          location: {
            lat: -6.2088,
            lng: 106.8456,
            address: values.address
          }
        }),
      });
      toast.success("Request submitted successfully!");
      onSuccess();
      form.reset();
    } catch (error) {
      toast.error("Failed to submit request.");
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Waste Pickup</DialogTitle>
          <DialogDescription>
            Provide details about the waste you want to dispose.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="wasteType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waste Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select waste type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ORGANIC">Organic (Kitchen waste, leaves)</SelectItem>
                      <SelectItem value="NON_ORGANIC">Non-Organic (Plastic, Paper, Glass)</SelectItem>
                      <SelectItem value="B3">Hazardous (Battery, Electronic, Chemical)</SelectItem>
                      <SelectItem value="RESIDUE">Residue (Nappy, Used Tissues)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weightEstimate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 flex justify-end">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
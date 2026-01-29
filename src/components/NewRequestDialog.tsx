import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
import { MapDisplay } from './MapDisplay';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { Camera, MapPin, X } from 'lucide-react';
const formSchema = z.object({
  wasteType: z.enum(['ORGANIC', 'NON_ORGANIC', 'B3', 'RESIDUE']),
  weightEstimate: z.number().positive("Weight must be greater than 0"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  lat: z.number(),
  lng: z.number(),
});
type FormValues = z.infer<typeof formSchema>;
interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
export function NewRequestDialog({ open, onOpenChange, onSuccess }: NewRequestDialogProps) {
  const user = useAuthStore(s => s.user);
  const [photos, setPhotos] = useState<string[]>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wasteType: 'ORGANIC',
      weightEstimate: 1,
      address: user?.address || '',
      lat: -6.2247,
      lng: 106.8077,
    },
  });
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPhotos = filesArray.map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };
  async function onSubmit(values: FormValues) {
    try {
      await api('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          wasteType: values.wasteType,
          weightEstimate: values.weightEstimate,
          location: {
            lat: values.lat,
            lng: values.lng,
            address: values.address
          },
          photos
        }),
      });
      toast.success("Request submitted successfully!");
      onSuccess();
      form.reset();
      setPhotos([]);
    } catch (error) {
      toast.error("Failed to submit request.");
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Waste Pickup</DialogTitle>
          <DialogDescription>
            Provide details and location for your waste disposal request.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="ORGANIC">Organic</SelectItem>
                        <SelectItem value="NON_ORGANIC">Non-Organic</SelectItem>
                        <SelectItem value="B3">Hazardous (B3)</SelectItem>
                        <SelectItem value="RESIDUE">Residue</SelectItem>
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
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Photos of Waste</FormLabel>
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border">
                    <img src={photo} alt="Waste preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[10px] mt-1 text-muted-foreground">Add</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Pick Location
              </FormLabel>
              <div className="h-48 border rounded-lg overflow-hidden">
                <MapDisplay 
                  center={[form.getValues('lat'), form.getValues('lng')]} 
                  zoom={16}
                  markers={[{
                    position: [form.watch('lat'), form.watch('lng')],
                    label: "Pickup Location",
                    wasteType: form.watch('wasteType')
                  }]}
                  onClick={(latlng) => {
                    form.setValue('lat', latlng.lat);
                    form.setValue('lng', latlng.lng);
                  }}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter pickup address details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 w-full">
                {form.formState.isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
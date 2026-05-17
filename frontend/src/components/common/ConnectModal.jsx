import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const connectSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.coerce.number({ invalid_type_error: "Please enter a valid age" })
    .int()
    .min(1, "Age must be at least 1")
    .max(120, "Age must be less than 120"),
  weight: z.coerce.number({ invalid_type_error: "Please enter a valid weight" })
    .min(1, "Weight must be at least 1 kg")
    .max(500, "Weight must be less than 500 kg"),
  gender: z.string().min(1, "Please select a gender"),
  reason: z.string()
    .min(5, "Reason must be at least 5 characters")
    .max(300, "Reason must be less than 300 characters"),
  paymentOption: z.string().min(1, "Please select a payment option"),
});

const ConnectModal = ({ open, onClose, onSubmit, doctorName }) => {
  const maxChars = 300;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(connectSchema),
    defaultValues: {
      name: '',
      age: '',
      weight: '',
      gender: '',
      reason: '',
      paymentOption: '',
    },
    mode: 'onChange',
  });

  const reasonValue = watch('reason') || '';

  // Reset form when modal opens or closes
  useEffect(() => {
    if (open) {
      reset({
        name: '',
        age: '',
        weight: '',
        gender: '',
        reason: '',
        paymentOption: '',
      });
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data.name, data.reason);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Join Queue</DialogTitle>
          <DialogDescription>
            Please provide some details before connecting with {doctorName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4 px-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Full Name</label>
            <Input
              placeholder="Enter your full name"
              className={cn(errors.name && "border-red-500/50")}
              {...register('name')}
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Age (Years)</label>
              <Input
                type="number"
                placeholder="e.g. 25"
                className={cn(errors.age && "border-red-500/50")}
                {...register('age')}
              />
              {errors.age && <p className="text-red-400 text-xs">{errors.age.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Weight (kg)</label>
              <Input
                type="number"
                placeholder="e.g. 70"
                className={cn(errors.weight && "border-red-500/50")}
                {...register('weight')}
              />
              {errors.weight && <p className="text-red-400 text-xs">{errors.weight.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Gender</label>
            <select
              className={cn(
                "flex h-10 w-full rounded-md border border-border/50 bg-background-primary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary",
                errors.gender && "border-red-500/50"
              )}
              {...register('gender')}
            >
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="text-red-400 text-xs">{errors.gender.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Reason for Visit</label>
            <textarea
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-border/50 bg-background-primary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none text-text-primary",
                errors.reason && "border-red-500/50"
              )}
              placeholder="Briefly describe your symptoms or reason for consultation..."
              maxLength={maxChars}
              {...register('reason')}
            />
            <div className="flex justify-between text-xs">
              <span className="text-red-400">{errors.reason?.message}</span>
              <span className="text-text-secondary">
                {reasonValue.length} / {maxChars}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Payment Option</label>
            <select
              className={cn(
                "flex h-10 w-full rounded-md border border-border/50 bg-background-primary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary",
                errors.paymentOption && "border-red-500/50"
              )}
              {...register('paymentOption')}
            >
              <option value="" disabled>Select payment method</option>
              <option value="stripe">Stripe</option>
            </select>
            {errors.paymentOption && <p className="text-red-400 text-xs">{errors.paymentOption.message}</p>}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!isValid}
            >
              Payment Now
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onClose(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectModal;

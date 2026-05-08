import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const ConnectModal = ({ open, onClose, onSubmit, doctorName }) => {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const maxChars = 300;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && reason.trim()) {
      onSubmit(name, reason);
      // Reset form
      setName('');
      setReason('');
      setAge('');
      setWeight('');
      setGender('');
      setPaymentOption('');
    }
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
        <form onSubmit={handleSubmit} className="space-y-4 py-4 px-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Full Name</label>
            <Input
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Age (Years)</label>
              <Input
                type="number"
                placeholder="e.g. 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Weight (kg)</label>
              <Input
                type="number"
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Gender</label>
            <select
              className="flex h-10 w-full rounded-md border border-border/50 bg-background-primary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Reason for Visit</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-border/50 bg-background-primary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none text-text-primary"
              placeholder="Briefly describe your symptoms or reason for consultation..."
              maxLength={maxChars}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <div className="text-right text-xs text-text-secondary">
              {reason.length} / {maxChars}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Payment Option</label>
            <select
              className="flex h-10 w-full rounded-md border border-border/50 bg-background-primary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary"
              value={paymentOption}
              onChange={(e) => setPaymentOption(e.target.value)}
              required
            >
              <option value="" disabled>Select payment method</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!name.trim() || !reason.trim() || !age || !weight || !gender || !paymentOption}
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

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomBandForm } from '../types';
import { Plus, Music } from 'lucide-react';

interface CustomBandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customBand: CustomBandForm) => void;
}

export function CustomBandModal({
  isOpen,
  onClose,
  onConfirm,
}: CustomBandModalProps) {
  const [bandName, setBandName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bandName.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onConfirm({
        name: bandName.trim(),
      });
      
      // Reset form and close modal only on success
      setBandName('');
      onClose();
    } catch (error) {
      console.error('Error creating custom band:', error);
      // Don't close modal on error - let user try again
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBandName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-rhythm-600" />
              Add Custom Band
            </DialogTitle>
            <DialogDescription>
              Create a custom band that you can schedule for performances.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Band Name */}
            <div className="space-y-2">
              <Label htmlFor="band-name" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Band Name *
              </Label>
              <Input
                id="band-name"
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
                placeholder="Enter band name..."
                required
                className="w-full"
                autoFocus
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-blue-900 dark:text-blue-100 text-sm">
                <strong>Note:</strong> After creating the band, you'll be able to schedule it for a performance.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!bandName.trim() || isSubmitting}
              className="bg-rhythm-600 hover:bg-rhythm-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Band'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
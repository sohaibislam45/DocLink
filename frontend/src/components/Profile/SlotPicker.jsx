import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

const SlotPicker = ({ slots, selectedSlot, onSelectSlot }) => {
  return (
    <div className="space-y-6">
      {slots.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-3">
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {group.date}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {group.times.map((time) => {
              const slotId = `${group.date}-${time}`;
              const isSelected = selectedSlot === slotId;
              
              return (
                <Button
                  key={time}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectSlot(slotId)}
                  className={cn(
                    "transition-all duration-200",
                    isSelected 
                      ? "bg-accent-primary text-white border-accent-primary shadow-md shadow-accent-primary/20" 
                      : "bg-background-tertiary/50 border-border/50 hover:border-accent-primary/50 text-text-secondary hover:text-accent-primary"
                  )}
                >
                  {time}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlotPicker;

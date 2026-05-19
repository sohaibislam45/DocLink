import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Slider } from '../ui/Slider';
import { cn } from '../../lib/utils';
import { fetchSpecialties } from '../../api/common';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/50 py-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 text-left group"
      >
        <span className="font-bold text-sm uppercase tracking-wider text-text-primary group-hover:text-accent-primary transition-colors">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-text-secondary transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterSidebar = ({ filters, onFilterChange, onReset }) => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  useState(() => {
    const loadSpecs = async () => {
      const specData = await fetchSpecialties();
      setSpecialties(specData || []);
      setLoading(false);
    };
    loadSpecs();
  }, []);
  const ratings = [
    { label: "Any", value: 0 },
    { label: "3★ & up", value: 3 },
    { label: "4★ & up", value: 4 },
    { label: "4.5★ & up", value: 4.5 },
  ];

  const availabilityOptions = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
  ];

  return (
    <div className="space-y-2">
      {/* Specialty Filter */}
      <FilterSection title="Specialty">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('specialty', 'All')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
              filters.specialty === 'All'
                ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20"
                : "bg-background-tertiary/50 border-border/50 text-text-secondary hover:border-accent-primary/50"
            )}
          >
            All
          </button>
          {loading ? (
            <span className="text-xs text-text-secondary px-2">Loading...</span>
          ) : (
            <>
              {(showAllSpecialties ? specialties : specialties.slice(0, 5)).map((spec) => (
                <button
                  key={spec.id || spec._id}
                  onClick={() => onFilterChange('specialty', spec.name)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                    filters.specialty === spec.name
                      ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20"
                      : "bg-background-tertiary/50 border-border/50 text-text-secondary hover:border-accent-primary/50"
                  )}
                >
                  {spec.name}
                </button>
              ))}
              {specialties.length > 5 && (
                <button
                  onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                  className="text-xs text-accent-primary font-semibold hover:underline mt-2 flex items-center justify-center gap-1 w-full"
                >
                  {showAllSpecialties ? "Show Less" : `+ More (${specialties.length - 5})`}
                </button>
              )}
            </>
          )}
        </div>
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection title="Minimum Rating">
        <div className="flex flex-wrap gap-2">
          {ratings.map((rating) => (
            <button
              key={rating.value}
              onClick={() => onFilterChange('rating', rating.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                filters.rating === rating.value
                  ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20"
                  : "bg-background-tertiary/50 border-border/50 text-text-secondary hover:border-accent-primary/50"
              )}
            >
              {rating.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection title="Consultation Fee">
        <div className="space-y-4 px-2">
          <Slider
            defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
            max={1000}
            step={10}
            onValueChange={(value) => onFilterChange('priceRange', value)}
            className="pt-2"
          />
        </div>
      </FilterSection>

      {/* Availability Filter */}
      <FilterSection title="Availability">
        <div className="flex flex-wrap gap-2">
          {availabilityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange('availability', filters.availability === opt.value ? null : opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                filters.availability === opt.value
                  ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20"
                  : "bg-background-tertiary/50 border-border/50 text-text-secondary hover:border-accent-primary/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Gender Filter */}
      <FilterSection title="Gender">
        <div className="flex flex-wrap gap-2">
          {['All', 'male', 'female'].map((g) => (
            <button
              key={g}
              onClick={() => onFilterChange('gender', g)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border capitalize",
                filters.gender === g
                  ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20"
                  : "bg-background-tertiary/50 border-border/50 text-text-secondary hover:border-accent-primary/50"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Actions */}
      <div className="pt-6 space-y-3">
        <Button 
          onClick={onReset}
          variant="ghost" 
          className="w-full text-text-secondary hover:text-accent-primary border border-transparent hover:border-accent-primary/20"
        >
          Reset All
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;

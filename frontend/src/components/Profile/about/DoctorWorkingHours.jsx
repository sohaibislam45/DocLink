import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../ui/Card';
import { useDoctorProfile } from '../../../context/DoctorProfileContext';
import * as Lucide from 'lucide-react';

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DEFAULT_HOURS = {
  Saturday: { enabled: false, from: "09:00", to: "17:00" },
  Sunday: { enabled: false, from: "09:00", to: "17:00" },
  Monday: { enabled: true, from: "09:00", to: "17:00" },
  Tuesday: { enabled: true, from: "09:00", to: "17:00" },
  Wednesday: { enabled: true, from: "09:00", to: "17:00" },
  Thursday: { enabled: true, from: "09:00", to: "17:00" },
  Friday: { enabled: true, from: "09:00", to: "17:00" },
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hourStr, minStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minStr} ${ampm}`;
};

const DoctorWorkingHours = () => {
  const { doctor } = useDoctorProfile();
  const hours = doctor.workingHours || DEFAULT_HOURS;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
        <Lucide.Clock className="w-5 h-5 text-accent-primary" />
        Working Hours / Weekly Schedule
      </h2>
      <Card className="bg-background-secondary/30 border-border/30 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DAYS.map((day) => {
              const schedule = hours[day] || { enabled: false };
              return (
                <div
                  key={day}
                  className={`flex flex-col p-4 rounded-xl border transition-all ${
                    schedule.enabled
                      ? "bg-background-tertiary/40 border-accent-primary/20 hover:border-accent-primary/40 shadow-sm"
                      : "bg-background-secondary/10 border-border/10 opacity-40"
                  }`}
                >
                  <span className="font-bold text-text-primary text-sm">{day}</span>
                  {schedule.enabled ? (
                    <div className="mt-2 flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Available
                      </span>
                      <span className="text-[11px] text-text-secondary font-medium mt-1">
                        {formatTime(schedule.from)} - {formatTime(schedule.to)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary/50 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/30" />
                        Day Off
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorWorkingHours;

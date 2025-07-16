'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { format, addDays, isSameDay, isWeekend } from 'date-fns';
import { cn } from '@/lib/utils';
import { type ServiceType, type CreateOrderForm } from '@/types/orders';
import { getProviderAvailability } from '@/lib/orders/availability';

interface SchedulingStepProps {
  scheduledDate?: Date;
  scheduledTimeSlot?: string;
  serviceType: ServiceType;
  providerId?: string;
  onUpdate: (data: Partial<CreateOrderForm>) => void;
  onNext: () => void;
  onBack: () => void;
}

const timeSlots = [
  { id: '09:00', label: '9:00 AM', period: 'morning' },
  { id: '10:00', label: '10:00 AM', period: 'morning' },
  { id: '11:00', label: '11:00 AM', period: 'morning' },
  { id: '12:00', label: '12:00 PM', period: 'afternoon' },
  { id: '14:00', label: '2:00 PM', period: 'afternoon' },
  { id: '15:00', label: '3:00 PM', period: 'afternoon' },
  { id: '16:00', label: '4:00 PM', period: 'afternoon' },
  { id: '17:00', label: '5:00 PM', period: 'afternoon' },
];

export function SchedulingStep({
  scheduledDate,
  scheduledTimeSlot,
  serviceType,
  providerId,
  onUpdate,
  onNext,
  onBack
}: SchedulingStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(scheduledDate);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate && providerId) {
      loadAvailability();
    } else {
      // If no provider, all slots are available
      setAvailableSlots(timeSlots.map(s => s.id));
    }
  }, [selectedDate, providerId]);

  const loadAvailability = async () => {
    if (!selectedDate || !providerId) return;
    
    setLoading(true);
    try {
      const availability = await getProviderAvailability(providerId, selectedDate);
      setAvailableSlots(availability.availableSlots.filter(s => s.available).map(s => s.time));
    } catch (error) {
      console.error('Error loading availability:', error);
      // Fallback to all slots available
      setAvailableSlots(timeSlots.map(s => s.id));
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onUpdate({ scheduledDate: date });
      // Reset time slot when date changes
      onUpdate({ scheduledTimeSlot: undefined });
    }
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    onUpdate({ scheduledTimeSlot: timeSlot });
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const suggestedDates = [
    { date: new Date(), label: 'Today' },
    { date: addDays(new Date(), 1), label: 'Tomorrow' },
    { date: addDays(new Date(), 2), label: format(addDays(new Date(), 2), 'EEEE') },
  ].filter(d => !isWeekend(d.date));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Schedule Service</h2>
        <p className="text-muted-foreground">
          Choose when you want the service to be performed
        </p>
      </div>

      {/* Quick Date Selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Quick selection</p>
        <div className="grid grid-cols-3 gap-2">
          {suggestedDates.map((suggestion) => (
            <Button
              key={suggestion.label}
              variant={selectedDate && isSameDay(selectedDate, suggestion.date) ? "default" : "outline"}
              size="sm"
              onClick={() => handleDateSelect(suggestion.date)}
              className="cursor-pointer"
            >
              {suggestion.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Select Date
          </CardTitle>
          <CardDescription>
            Choose your preferred date for the service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Select Time
            </CardTitle>
            <CardDescription>
              Available time slots for {format(selectedDate, 'EEEE, MMMM d')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Loading availability...</p>
              </div>
            ) : (
              <RadioGroup value={scheduledTimeSlot} onValueChange={handleTimeSlotSelect}>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3">Morning</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {timeSlots
                        .filter(slot => slot.period === 'morning')
                        .map((slot) => {
                          const isAvailable = availableSlots.includes(slot.id);
                          return (
                            <Label
                              key={slot.id}
                              htmlFor={slot.id}
                              className={cn(
                                "cursor-pointer",
                                !isAvailable && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div className={cn(
                                "flex items-center gap-2 p-3 rounded-lg border text-center",
                                scheduledTimeSlot === slot.id && "border-primary bg-primary/5",
                                !isAvailable && "bg-muted"
                              )}>
                                <RadioGroupItem 
                                  value={slot.id} 
                                  id={slot.id}
                                  disabled={!isAvailable}
                                />
                                <span className="text-sm">{slot.label}</span>
                              </div>
                            </Label>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Afternoon</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {timeSlots
                        .filter(slot => slot.period === 'afternoon')
                        .map((slot) => {
                          const isAvailable = availableSlots.includes(slot.id);
                          return (
                            <Label
                              key={slot.id}
                              htmlFor={slot.id}
                              className={cn(
                                "cursor-pointer",
                                !isAvailable && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div className={cn(
                                "flex items-center gap-2 p-3 rounded-lg border text-center",
                                scheduledTimeSlot === slot.id && "border-primary bg-primary/5",
                                !isAvailable && "bg-muted"
                              )}>
                                <RadioGroupItem 
                                  value={slot.id} 
                                  id={slot.id}
                                  disabled={!isAvailable}
                                />
                                <span className="text-sm">{slot.label}</span>
                              </div>
                            </Label>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </RadioGroup>
            )}

            {selectedDate && availableSlots.length === 0 && !loading && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-50 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">
                  No available slots for this date. Please select another date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedDate || !scheduledTimeSlot}
          className="cursor-pointer"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
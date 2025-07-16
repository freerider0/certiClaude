'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, X, Search } from 'lucide-react';
import { type OrderFilters, type OrderStatus, type ServiceType } from '@/types/orders';

interface OrdersFiltersProps {
  onFilterChange: (filters: OrderFilters) => void;
}

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'assigned', label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const serviceOptions: { value: ServiceType; label: string }[] = [
  { value: 'photography', label: 'Photography' },
  { value: 'cee_certificate', label: 'Energy Certificate' },
  { value: 'floor_plan', label: 'Floor Plans' },
  { value: 'virtual_tour', label: 'Virtual Tour' },
  { value: 'videography', label: 'Videography' },
];

export function OrdersFilters({ onFilterChange }: OrdersFiltersProps) {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleSearch = () => {
    updateFilters({ search });
  };

  const handleStatusToggle = (status: OrderStatus) => {
    const currentStatuses = filters.status || [];
    const updated = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    updateFilters({ status: updated.length > 0 ? updated : undefined });
  };

  const handleServiceChange = (service: ServiceType | 'all') => {
    updateFilters({ 
      serviceType: service === 'all' ? undefined : [service] 
    });
  };

  const handleDateChange = () => {
    updateFilters({
      dateFrom,
      dateTo
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setDateFrom(undefined);
    setDateTo(undefined);
    onFilterChange({});
  };

  const activeFilterCount = 
    (filters.status?.length || 0) + 
    (filters.serviceType?.length || 0) + 
    (filters.dateFrom ? 1 : 0) + 
    (filters.dateTo ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="space-y-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by order ID, property, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="cursor-pointer">
          Search
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Service Type Filter */}
        <Select 
          value={filters.serviceType?.[0] || 'all'} 
          onValueChange={handleServiceChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {serviceOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal cursor-pointer",
                !dateFrom && !dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom || dateTo ? (
                <span>
                  {dateFrom && format(dateFrom, "PP")} 
                  {dateFrom && dateTo && " - "}
                  {dateTo && format(dateTo, "PP")}
                </span>
              ) : (
                <span>Pick date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">From</p>
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">To</p>
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                />
              </div>
              <Button 
                onClick={handleDateChange} 
                className="w-full cursor-pointer"
              >
                Apply Date Range
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="cursor-pointer"
          >
            Clear filters ({activeFilterCount})
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Status</p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(status => (
            <Badge
              key={status.value}
              variant={filters.status?.includes(status.value) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                filters.status?.includes(status.value) && status.color
              )}
              onClick={() => handleStatusToggle(status.value)}
            >
              {status.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
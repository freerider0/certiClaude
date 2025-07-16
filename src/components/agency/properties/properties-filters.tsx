'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, Star } from 'lucide-react';

export function PropertiesFilters() {
  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select defaultValue="newest">
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="views">Most Views</SelectItem>
            <SelectItem value="leads">Most Leads</SelectItem>
          </SelectContent>
        </Select>

        {/* More Filters */}
        <Button variant="outline">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Saved Filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Saved Filters:</span>
        <Button variant="ghost" size="sm">
          <Star className="mr-1 h-3 w-3" />
          My Listings
        </Button>
        <Button variant="ghost" size="sm">
          <Star className="mr-1 h-3 w-3" />
          Needs Photos
        </Button>
        <Button variant="ghost" size="sm">
          <Star className="mr-1 h-3 w-3" />
          Hot Properties
        </Button>
      </div>
    </div>
  );
}
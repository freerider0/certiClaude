'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  User, 
  Mail, 
  Phone,
  Plus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type CreateOrderForm } from '@/types/orders';

interface CustomerSelectionStepProps {
  customers: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  }>;
  selectedCustomerId?: string;
  customerData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  onUpdate: (data: Partial<CreateOrderForm>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CustomerSelectionStep({
  customers,
  selectedCustomerId,
  customerData = {},
  onUpdate,
  onNext,
  onBack
}: CustomerSelectionStepProps) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(selectedCustomerId ? 'existing' : 'new');

  const filteredCustomers = customers.filter(customer => {
    const searchLower = search.toLowerCase();
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  });

  const handleCustomerSelect = (customerId: string) => {
    onUpdate({ 
      customerId,
      customerFirstName: undefined,
      customerLastName: undefined,
      customerEmail: undefined,
      customerPhone: undefined
    });
  };

  const handleNewCustomerData = (field: string, value: string) => {
    const updates: Partial<CreateOrderForm> = {
      customerId: undefined // Clear selected customer when entering new data
    };
    
    switch (field) {
      case 'firstName':
        updates.customerFirstName = value;
        break;
      case 'lastName':
        updates.customerLastName = value;
        break;
      case 'email':
        updates.customerEmail = value;
        break;
      case 'phone':
        updates.customerPhone = value;
        break;
    }
    
    onUpdate(updates);
  };

  const isNewCustomerValid = customerData.firstName && 
    customerData.lastName && 
    customerData.email;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
        <p className="text-muted-foreground">
          Select an existing customer or add a new one
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing" className="cursor-pointer">
            Existing Customer
          </TabsTrigger>
          <TabsTrigger value="new" className="cursor-pointer">
            New Customer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <RadioGroup value={selectedCustomerId} onValueChange={handleCustomerSelect}>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No customers found</p>
                    <Button
                      variant="link"
                      onClick={() => setTab('new')}
                      className="cursor-pointer"
                    >
                      Add new customer
                    </Button>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <Label
                      key={customer.id}
                      htmlFor={customer.id}
                      className="cursor-pointer"
                    >
                      <Card
                        className={cn(
                          "transition-colors hover:bg-muted/50",
                          selectedCustomerId === customer.id && "border-primary bg-primary/5"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <RadioGroupItem value={customer.id} id={customer.id} />
                            
                            <div className="p-2 rounded-full bg-muted">
                              <User className="h-4 w-4" />
                            </div>

                            <div className="flex-1">
                              <p className="font-medium">
                                {customer.first_name} {customer.last_name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Mail className="h-3 w-3" />
                                <span>{customer.email}</span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  ))
                )}
              </div>
            </ScrollArea>
          </RadioGroup>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Customer Details
              </CardTitle>
              <CardDescription>
                This customer will be saved for future orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={customerData.firstName || ''}
                    onChange={(e) => handleNewCustomerData('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={customerData.lastName || ''}
                    onChange={(e) => handleNewCustomerData('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email || ''}
                  onChange={(e) => handleNewCustomerData('email', e.target.value)}
                  placeholder="john.doe@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerData.phone || ''}
                  onChange={(e) => handleNewCustomerData('phone', e.target.value)}
                  placeholder="+34 600 000 000"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
          disabled={tab === 'existing' ? !selectedCustomerId : !isNewCustomerValid}
          className="cursor-pointer"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
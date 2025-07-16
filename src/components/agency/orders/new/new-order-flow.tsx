'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewOrderHeader } from './new-order-header';
import { PropertySelectionStep } from './steps/property-selection-step';
import { ServiceConfigurationStep } from './steps/service-configuration-step';
import { SchedulingStep } from './steps/scheduling-step';
import { CustomerSelectionStep } from './steps/customer-selection-step';
import { ReviewStep } from './steps/review-step';
import { type CreateOrderForm, type Provider } from '@/types/orders';
import { createOrder } from '@/lib/orders/create-order';
import { toast } from 'sonner';

type Step = 'property' | 'service' | 'schedule' | 'customer' | 'review';

interface NewOrderFlowProps {
  properties: Array<{
    id: string;
    address: string;
    city: string;
    postal_code: string;
    type: string;
    images?: string[];
  }>;
  customers: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  }>;
  currentProvider: Provider | null;
  agencyId: string;
}

export function NewOrderFlow({ properties, customers, currentProvider, agencyId }: NewOrderFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('property');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [orderData, setOrderData] = useState<CreateOrderForm>({
    propertyId: '',
    serviceType: 'photography',
    urgency: 'standard'
  });

  const steps: Step[] = ['property', 'service', 'schedule', 'customer', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'property':
        return !!orderData.propertyId;
      case 'service':
        return !!orderData.serviceType;
      case 'schedule':
        return !!orderData.scheduledDate;
      case 'customer':
        return !!orderData.customerId || 
          (!!orderData.customerFirstName && !!orderData.customerLastName && !!orderData.customerEmail);
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleUpdateData = (data: Partial<CreateOrderForm>) => {
    setOrderData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createOrder({
        ...orderData,
        agencyId,
        providerId: currentProvider?.id
      });
      
      if (result.success && result.orderId) {
        toast.success('Order created successfully');
        router.push(`/agency/orders/${result.orderId}`);
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProperty = properties.find(p => p.id === orderData.propertyId);
  const selectedCustomer = customers.find(c => c.id === orderData.customerId);

  return (
    <div className="space-y-6">
      <NewOrderHeader 
        currentStep={currentStep}
        steps={steps}
        onStepClick={(step) => {
          const stepIndex = steps.indexOf(step);
          if (stepIndex < currentStepIndex) {
            setCurrentStep(step);
          }
        }}
      />

      <div className="mx-auto max-w-4xl">
        {currentStep === 'property' && (
          <PropertySelectionStep
            properties={properties}
            selectedPropertyId={orderData.propertyId}
            onSelect={(propertyId) => handleUpdateData({ propertyId })}
            onNext={handleNext}
          />
        )}

        {currentStep === 'service' && (
          <ServiceConfigurationStep
            selectedService={orderData.serviceType}
            urgency={orderData.urgency}
            notes={orderData.notes}
            onUpdate={handleUpdateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 'schedule' && (
          <SchedulingStep
            scheduledDate={orderData.scheduledDate}
            scheduledTimeSlot={orderData.scheduledTimeSlot}
            serviceType={orderData.serviceType}
            providerId={currentProvider?.id}
            onUpdate={handleUpdateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 'customer' && (
          <CustomerSelectionStep
            customers={customers}
            selectedCustomerId={orderData.customerId}
            customerData={{
              firstName: orderData.customerFirstName,
              lastName: orderData.customerLastName,
              email: orderData.customerEmail,
              phone: orderData.customerPhone
            }}
            onUpdate={handleUpdateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            orderData={orderData}
            property={selectedProperty}
            customer={selectedCustomer}
            provider={currentProvider}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
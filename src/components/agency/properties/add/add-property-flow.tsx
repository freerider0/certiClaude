'use client';

import { useState } from 'react';
import { AddPropertyHeader } from './add-property-header';
import { DocumentUploadStep } from './steps/document-upload-step';
import { OCRProcessingStep } from './steps/ocr-processing-step';
import { PropertyDetailsStep } from './steps/property-details-step';
import { ServicesSelectionStep } from './steps/services-selection-step';
import { ConfirmationStep } from './steps/confirmation-step';
import { type OCRExtractedData, type CreatePropertyFormData, type ServiceType } from '@/lib/validations/property';
import { createProperty } from '@/app/[locale]/agency/properties/new/actions';
// processPropertyDocuments is imported but not used - will be used when implementing real OCR
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { processPropertyDocuments } from '@/app/[locale]/agency/properties/new/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Step = 'upload' | 'processing' | 'details' | 'services' | 'confirmation';

export function AddPropertyFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [propertyIdDoc, setPropertyIdDoc] = useState<File | null>(null);
  const [cadastralDoc, setCadastralDoc] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<OCRExtractedData | null>(null);
  const [propertyData, setPropertyData] = useState<CreatePropertyFormData | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDocumentsUploaded = (propertyId: File, cadastral: File) => {
    setPropertyIdDoc(propertyId);
    setCadastralDoc(cadastral);
    setCurrentStep('processing');
  };

  const handleOCRComplete = (extractedData: OCRExtractedData) => {
    setOcrData(extractedData);
    setCurrentStep('details');
  };

  const handleDetailsComplete = (data: CreatePropertyFormData) => {
    setPropertyData(data);
    setCurrentStep('services');
  };

  const handleServicesSelected = (services: ServiceType[]) => {
    setSelectedServices(services);
    setCurrentStep('confirmation');
  };

  const handleSubmit = async () => {
    if (!propertyData) return;
    
    setIsSubmitting(true);
    try {
      const result = await createProperty(propertyData, selectedServices);
      
      if (result.success && result.propertyId) {
        toast.success('Property created successfully!');
        router.push(`/agency/properties/${result.propertyId}`);
      } else {
        toast.error(result.message || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'processing':
        setCurrentStep('upload');
        break;
      case 'details':
        setCurrentStep('upload');
        break;
      case 'services':
        setCurrentStep('details');
        break;
      case 'confirmation':
        setCurrentStep('services');
        break;
    }
  };

  const steps = [
    { id: 'upload', label: 'Upload Documents' },
    { id: 'processing', label: 'Processing' },
    { id: 'details', label: 'Property Details' },
    { id: 'services', label: 'Select Services' },
    { id: 'confirmation', label: 'Confirmation' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="space-y-6">
      <AddPropertyHeader 
        steps={steps} 
        currentStep={currentStepIndex} 
        onBack={currentStep !== 'upload' ? handleBack : undefined}
      />

      {currentStep === 'upload' && (
        <DocumentUploadStep onNext={handleDocumentsUploaded} />
      )}

      {currentStep === 'processing' && propertyIdDoc && cadastralDoc && (
        <OCRProcessingStep 
          propertyIdDoc={propertyIdDoc}
          cadastralDoc={cadastralDoc}
          onComplete={handleOCRComplete}
        />
      )}

      {currentStep === 'details' && ocrData && (
        <PropertyDetailsStep 
          ocrData={ocrData}
          onNext={handleDetailsComplete}
        />
      )}

      {currentStep === 'services' && (
        <ServicesSelectionStep 
          onNext={handleServicesSelected}
          selectedServices={selectedServices}
        />
      )}

      {currentStep === 'confirmation' && propertyData && (
        <ConfirmationStep 
          propertyData={propertyData}
          selectedServices={selectedServices}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
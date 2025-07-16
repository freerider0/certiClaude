'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, FileSearch, Home, Sparkles } from 'lucide-react';
import { processPropertyDocuments } from '@/app/[locale]/agency/properties/new/actions';
import { type OCRExtractedData } from '@/lib/validations/property';
import { cn } from '@/lib/utils';

interface OCRProcessingStepProps {
  propertyIdDoc: File;
  cadastralDoc: File;
  onComplete: (data: OCRExtractedData) => void;
}

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

export function OCRProcessingStep({ propertyIdDoc, cadastralDoc, onComplete }: OCRProcessingStepProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'upload', label: 'Uploading documents', status: 'pending' },
    { id: 'analyze-property', label: 'Analyzing Property ID Document', status: 'pending' },
    { id: 'analyze-cadastral', label: 'Extracting Cadastral Information', status: 'pending' },
    { id: 'validate', label: 'Validating extracted data', status: 'pending' },
    { id: 'complete', label: 'Processing complete', status: 'pending' }
  ]);
  
  const [extractedData, setExtractedData] = useState<Partial<OCRExtractedData>>({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    processDocuments();
  }, []);

  const processDocuments = async () => {
    // Step 1: Upload
    updateStep('upload', 'processing');
    await simulateDelay(500);
    updateStep('upload', 'completed');
    setProgress(20);

    // Step 2: Analyze Property ID
    updateStep('analyze-property', 'processing');
    await simulateDelay(1500);
    
    // Simulate extracting data progressively
    setExtractedData(prev => ({
      ...prev,
      registryNumber: "REG-2024-12345",
      address: "Calle Mayor 123, 4º 2ª",
      city: "Barcelona",
      province: "Barcelona"
    }));
    
    updateStep('analyze-property', 'completed');
    setProgress(40);

    // Step 3: Analyze Cadastral
    updateStep('analyze-cadastral', 'processing');
    await simulateDelay(1500);
    
    setExtractedData(prev => ({
      ...prev,
      cadastralReference: "1234567 VD8901 S 0001 WX",
      size_m2: 85,
      yearBuilt: 1975,
      energyRating: "E"
    }));
    
    updateStep('analyze-cadastral', 'completed');
    setProgress(70);

    // Step 4: Validate
    updateStep('validate', 'processing');
    await simulateDelay(1000);
    updateStep('validate', 'completed');
    setProgress(90);

    // Step 5: Complete
    updateStep('complete', 'completed');
    setProgress(100);

    // Call the actual OCR processing
    const formData1 = new FormData();
    formData1.append('file', propertyIdDoc);
    
    const formData2 = new FormData();
    formData2.append('file', cadastralDoc);
    
    const result = await processPropertyDocuments(formData1, formData2);
    
    // Wait a bit before transitioning
    await simulateDelay(500);
    onComplete(result);
  };

  const updateStep = (stepId: string, status: ProcessingStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Circle className="h-5 w-5 text-primary animate-pulse" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Document Processing
          </CardTitle>
          <CardDescription>
            Extracting property information from your documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {progress}% Complete
            </p>
          </div>

          {/* Processing Steps */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <span className={cn(
                  "text-sm",
                  step.status === 'completed' && "text-muted-foreground",
                  step.status === 'processing' && "font-medium"
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extracted Data Preview */}
      {Object.keys(extractedData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Extracted Information
            </CardTitle>
            <CardDescription>
              Data found in your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {extractedData.registryNumber && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registry Number</p>
                  <p className="font-medium">{extractedData.registryNumber}</p>
                  <Badge variant="secondary" className="text-xs">95% confidence</Badge>
                </div>
              )}
              
              {extractedData.address && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{extractedData.address}</p>
                  <Badge variant="secondary" className="text-xs">92% confidence</Badge>
                </div>
              )}
              
              {extractedData.cadastralReference && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cadastral Reference</p>
                  <p className="font-medium">{extractedData.cadastralReference}</p>
                  <Badge variant="secondary" className="text-xs">97% confidence</Badge>
                </div>
              )}
              
              {extractedData.size_m2 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{extractedData.size_m2} m²</p>
                  <Badge variant="secondary" className="text-xs">90% confidence</Badge>
                </div>
              )}
              
              {extractedData.yearBuilt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">{extractedData.yearBuilt}</p>
                  <Badge variant="secondary" className="text-xs">85% confidence</Badge>
                </div>
              )}
              
              {extractedData.energyRating && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Energy Rating</p>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-2 py-1 rounded font-bold text-white",
                      extractedData.energyRating === 'A' && "bg-green-600",
                      extractedData.energyRating === 'B' && "bg-green-500",
                      extractedData.energyRating === 'C' && "bg-yellow-500",
                      extractedData.energyRating === 'D' && "bg-orange-500",
                      extractedData.energyRating === 'E' && "bg-red-500",
                      extractedData.energyRating === 'F' && "bg-red-600",
                      extractedData.energyRating === 'G' && "bg-red-700"
                    )}>
                      {extractedData.energyRating}
                    </div>
                    <Badge variant="secondary" className="text-xs">80% confidence</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Animation */}
      <div className="flex justify-center py-8">
        <div className="relative">
          <Home className="h-16 w-16 text-primary animate-pulse" />
          <div className="absolute inset-0 animate-ping">
            <Home className="h-16 w-16 text-primary opacity-30" />
          </div>
        </div>
      </div>
    </div>
  );
}
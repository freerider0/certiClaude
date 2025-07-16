'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  Download, 
  Eye, 
  Trash2,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import { type OrderWithDetails, type OrderDocument, type DocumentType } from '@/types/orders';
import { toast } from 'sonner';

interface OrderDocumentsProps {
  order: OrderWithDetails;
  documents: OrderDocument[];
}

const documentTypeConfig: Record<DocumentType, { label: string; icon: any }> = {
  photo: { label: 'Photo', icon: ImageIcon },
  certificate: { label: 'Certificate', icon: FileText },
  floor_plan: { label: 'Floor Plan', icon: FileText },
  report: { label: 'Report', icon: FileText },
  invoice: { label: 'Invoice', icon: FileText },
  other: { label: 'Other', icon: File },
};

export function OrderDocuments({ order, documents }: OrderDocumentsProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('photo');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // TODO: Implement actual file upload
      toast.success('Document uploaded successfully');
      setUploadDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: OrderDocument) => {
    // TODO: Implement file download
    window.open(doc.file_url, '_blank');
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      // TODO: Implement document deletion
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    const type = doc.document_type as DocumentType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<DocumentType, OrderDocument[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Service deliverables and related documents
            </CardDescription>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Add a new document to this order
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(documentTypeConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="cursor-pointer"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No documents uploaded yet
            </p>
            <p className="text-sm text-muted-foreground">
              Upload photos, certificates, or reports for this order
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDocuments).map(([type, docs]) => {
              const config = documentTypeConfig[type as DocumentType];
              const Icon = config.icon;
              
              return (
                <div key={type}>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {config.label}s ({docs.length})
                  </h4>
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.file_size && formatFileSize(doc.file_size)} • 
                              Uploaded {format(new Date(doc.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownload(doc)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownload(doc)}
                            className="cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(doc.id)}
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
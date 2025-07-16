'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { deleteProperty } from '@/app/[locale]/agency/properties/[id]/edit/actions';
import { useRouter } from 'next/navigation';
import type { Property } from '@/app/[locale]/agency/properties/actions';

interface EditPropertyHeaderProps {
  property: Property;
  isDirty?: boolean;
}

export function EditPropertyHeader({ property, isDirty = false }: EditPropertyHeaderProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProperty(property.id);
      router.push('/agency/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/agency/properties" className="hover:text-primary cursor-pointer">
          Properties
        </Link>
        <span>/</span>
        <Link href={`/agency/properties/${property.id}`} className="hover:text-primary cursor-pointer">
          {property.address}
        </Link>
        <span>/</span>
        <span>Edit</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href={`/agency/properties/${property.id}`}>
              <Button variant="ghost" size="sm" className="cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Property
              </Button>
            </Link>
            {isDirty && (
              <span className="text-sm text-amber-600 font-medium">
                Unsaved changes
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Property
          </h1>
          <p className="text-muted-foreground">
            {property.address}
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/agency/properties/${property.id}`}>
            <Button variant="outline" className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Property
            </Button>
          </Link>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the property
                  &quot;{property.address}&quot; and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Property'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
import { DemolitionRequestForm } from '@/features/demolition/request/ui/DemolitionRequestForm';

/**
 * District Office - Demolition Request Page
 * Allows district office staff to create new demolition supervision requests
 */
export default function DistrictDemolitionRequestPage() {
  return (
    <div className="container mx-auto py-6">
      <DemolitionRequestForm />
    </div>
  );
}

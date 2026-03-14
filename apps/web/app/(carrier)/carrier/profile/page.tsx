import { CarrierProfileForm } from '@/components/carrier/CarrierProfileForm';
import { ComplianceDashboard } from '@/components/carrier/ComplianceDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata = {
  title: 'Carrier Profile',
  description: 'Manage your carrier profile and compliance documents',
};

export default function CarrierProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Carrier Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your carrier information and compliance documents
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <CarrierProfileForm />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

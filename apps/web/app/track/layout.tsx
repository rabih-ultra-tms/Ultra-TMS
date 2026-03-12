import * as React from 'react';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Track Your Shipment',
  description: 'Track your shipment in real-time with our public tracking tool',
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}

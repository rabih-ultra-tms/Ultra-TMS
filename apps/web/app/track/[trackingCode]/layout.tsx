import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackingCode: string }>;
}): Promise<Metadata> {
  const { trackingCode } = await params;

  return {
    title: `Track Shipment ${trackingCode} | Ultra TMS`,
    description: `Track the status and location of shipment ${trackingCode}. Real-time updates on pickup, transit, and delivery status.`,
    openGraph: {
      title: `Shipment Tracking: ${trackingCode}`,
      description: `Track your shipment ${trackingCode} in real-time with Ultra TMS. View current status, stops, and estimated delivery.`,
      type: "website",
      siteName: "Ultra TMS",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

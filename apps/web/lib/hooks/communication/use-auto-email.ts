"use client";

import { useCallback, useRef } from "react";
import { useSendEmail, type SendEmailPayload } from "./use-send-email";
import { toast } from "sonner";

export type AutoEmailType =
  | "rate_confirmation"
  | "load_tendered"
  | "pickup_reminder"
  | "delivery_confirmation"
  | "invoice_sent";

/**
 * Minimal load data needed for auto-email triggers.
 * Works with both the Load type (from load detail) and DispatchLoad type (from dispatch board).
 */
export interface AutoEmailLoadData {
  id: string;
  loadNumber: string;
  carrierId?: string;
  carrierEmail?: string;
  carrierName?: string;
  customerEmail?: string;
  customerId?: string;
  customerName?: string;
  originCity?: string;
  originState?: string;
  destinationCity?: string;
  destinationState?: string;
  pickupDate?: string;
  deliveryDate?: string;
}

interface AutoEmailConfig {
  templateCode: string;
  subject: (loadNumber: string) => string;
  body: (loadNumber: string) => string;
  recipientType: "CARRIER" | "CONTACT";
  toastSuccess: string;
  toastDescription: (loadNumber: string) => string;
}

const AUTO_EMAIL_CONFIG: Record<AutoEmailType, AutoEmailConfig> = {
  rate_confirmation: {
    templateCode: "RATE_CONFIRMATION",
    subject: (ln) => `Rate Confirmation - Load ${ln}`,
    body: (ln) =>
      `Please find attached the rate confirmation for Load ${ln}. Review and sign at your earliest convenience.`,
    recipientType: "CARRIER",
    toastSuccess: "Rate confirmation sent",
    toastDescription: (ln) =>
      `Rate confirmation for ${ln} has been emailed to the carrier`,
  },
  load_tendered: {
    templateCode: "LOAD_ASSIGNED",
    subject: (ln) => `Load Tender - ${ln}`,
    body: (ln) =>
      `You have been tendered Load ${ln}. Please review the details and accept or reject this load.`,
    recipientType: "CARRIER",
    toastSuccess: "Tender notification sent",
    toastDescription: (ln) =>
      `Tender notification for ${ln} has been emailed to the carrier`,
  },
  pickup_reminder: {
    templateCode: "LOAD_STATUS_UPDATE",
    subject: (ln) => `Pickup Reminder - Load ${ln}`,
    body: (ln) =>
      `This is a reminder that Load ${ln} is scheduled for pickup. Please confirm your driver is en route.`,
    recipientType: "CARRIER",
    toastSuccess: "Pickup reminder sent",
    toastDescription: (ln) =>
      `Pickup reminder for ${ln} has been emailed to the carrier`,
  },
  delivery_confirmation: {
    templateCode: "DOCUMENT_RECEIVED",
    subject: (ln) => `Delivery Confirmation - Load ${ln}`,
    body: (ln) =>
      `Load ${ln} has been delivered and proof of delivery has been received. Thank you for your business.`,
    recipientType: "CONTACT",
    toastSuccess: "Delivery confirmation sent",
    toastDescription: (ln) =>
      `Delivery confirmation for ${ln} has been emailed to the customer`,
  },
  invoice_sent: {
    templateCode: "INVOICE_CREATED",
    subject: (ln) => `Invoice - Load ${ln}`,
    body: (ln) =>
      `Please find attached the invoice for Load ${ln}. Payment is due per the agreed terms.`,
    recipientType: "CONTACT",
    toastSuccess: "Invoice email sent",
    toastDescription: (ln) =>
      `Invoice for ${ln} has been emailed to the customer`,
  },
};

function getRecipientEmail(data: AutoEmailLoadData, type: AutoEmailType): string {
  const config = AUTO_EMAIL_CONFIG[type];
  if (config.recipientType === "CARRIER") {
    return data.carrierEmail || "";
  }
  return data.customerEmail || "";
}

function getRecipientName(data: AutoEmailLoadData, type: AutoEmailType): string {
  const config = AUTO_EMAIL_CONFIG[type];
  if (config.recipientType === "CARRIER") {
    return data.carrierName || "";
  }
  return data.customerName || "";
}

function getRecipientId(data: AutoEmailLoadData, type: AutoEmailType): string | undefined {
  const config = AUTO_EMAIL_CONFIG[type];
  if (config.recipientType === "CARRIER") {
    return data.carrierId;
  }
  return data.customerId;
}

/**
 * Extract AutoEmailLoadData from a Load object (from load detail page).
 */
export function loadToEmailData(load: {
  id: string;
  loadNumber: string;
  carrierId?: string;
  carrier?: { legalName?: string; contactEmail?: string; dispatchEmail?: string };
  order?: { customer?: { id?: string; name?: string; email?: string; contactEmail?: string } };
  originCity?: string;
  originState?: string;
  destinationCity?: string;
  destinationState?: string;
  pickupDate?: string;
  deliveryDate?: string;
}): AutoEmailLoadData {
  return {
    id: load.id,
    loadNumber: load.loadNumber,
    carrierId: load.carrierId,
    carrierEmail: load.carrier?.dispatchEmail || load.carrier?.contactEmail,
    carrierName: load.carrier?.legalName,
    customerEmail: load.order?.customer?.contactEmail || load.order?.customer?.email,
    customerId: load.order?.customer?.id,
    customerName: load.order?.customer?.name,
    originCity: load.originCity,
    originState: load.originState,
    destinationCity: load.destinationCity,
    destinationState: load.destinationState,
    pickupDate: load.pickupDate,
    deliveryDate: load.deliveryDate,
  };
}

/**
 * Extract AutoEmailLoadData from a DispatchLoad object (from dispatch board).
 */
export function dispatchLoadToEmailData(load: {
  id: number;
  loadNumber: string;
  carrier?: { id: number; name: string; contactEmail?: string };
  customer: { id: number; name: string; email?: string };
  stops: Array<{ type: string; city: string; state: string; appointmentDate: string }>;
}): AutoEmailLoadData {
  const pickup = load.stops.find((s) => s.type === "PICKUP");
  const delivery = load.stops.find((s) => s.type === "DELIVERY");

  return {
    id: load.id.toString(),
    loadNumber: load.loadNumber,
    carrierId: load.carrier?.id.toString(),
    carrierEmail: load.carrier?.contactEmail,
    carrierName: load.carrier?.name,
    customerEmail: (load.customer as { email?: string })?.email,
    customerId: load.customer.id.toString(),
    customerName: load.customer.name,
    originCity: pickup?.city,
    originState: pickup?.state,
    destinationCity: delivery?.city,
    destinationState: delivery?.state,
    pickupDate: pickup?.appointmentDate,
    deliveryDate: delivery?.appointmentDate,
  };
}

/**
 * Hook for auto-sending emails on workflow triggers (dispatch, tender, POD upload, etc.)
 *
 * Sends the email silently and shows a success/failure toast.
 * If recipient email is not available, shows a warning toast instead of failing.
 */
export function useAutoEmail() {
  const sendEmail = useSendEmail();
  const sendEmailRef = useRef(sendEmail);
  sendEmailRef.current = sendEmail;

  const triggerEmail = useCallback(
    (
      type: AutoEmailType,
      data: AutoEmailLoadData,
      extra?: {
        attachments?: SendEmailPayload["attachments"];
        additionalVariables?: Record<string, unknown>;
      }
    ) => {
      const config = AUTO_EMAIL_CONFIG[type];
      const recipientEmail = getRecipientEmail(data, type);

      if (!recipientEmail) {
        toast.warning(`${config.toastSuccess} skipped`, {
          description: `No ${config.recipientType === "CARRIER" ? "carrier" : "customer"} email on file for ${data.loadNumber}. Use the Email button on Load Detail to send manually.`,
        });
        return;
      }

      const payload: SendEmailPayload = {
        templateCode: config.templateCode,
        subject: config.subject(data.loadNumber),
        body: config.body(data.loadNumber),
        recipientEmail,
        recipientName: getRecipientName(data, type),
        recipientType: config.recipientType,
        recipientId: getRecipientId(data, type),
        entityType: "LOAD",
        entityId: data.id,
        variables: {
          loadNumber: data.loadNumber,
          carrierName: data.carrierName,
          customerName: data.customerName,
          originCity: data.originCity,
          originState: data.originState,
          destinationCity: data.destinationCity,
          destinationState: data.destinationState,
          pickupDate: data.pickupDate,
          deliveryDate: data.deliveryDate,
          ...extra?.additionalVariables,
        },
        attachments: extra?.attachments,
      };

      sendEmailRef.current.mutate(payload, {
        onSuccess: (result) => {
          if (result.success) {
            toast.success(config.toastSuccess, {
              description: config.toastDescription(data.loadNumber),
            });
          }
        },
      });
    },
    [] // stable — uses ref instead of mutation object
  );

  return {
    triggerEmail,
    isPending: sendEmail.isPending,
  };
}

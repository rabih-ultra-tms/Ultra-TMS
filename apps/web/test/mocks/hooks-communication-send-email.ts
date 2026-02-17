/**
 * Manual mock for @/lib/hooks/communication/use-send-email
 *
 * Uses globalThis to guarantee shared state across ESM module instances.
 */
import { jest } from "@jest/globals";

const KEY = "__HOOKS_COMMUNICATION_SEND_EMAIL_MOCK__";

interface MockState {
  sendEmail: Record<string, unknown>;
}

function getShared(): MockState {
  if (!(globalThis as any)[KEY]) {
    (globalThis as any)[KEY] = {
      sendEmail: {
        mutate: jest.fn(),
        mutateAsync: jest.fn<() => Promise<unknown>>().mockResolvedValue({
          success: true,
          logId: "log-1",
        }),
        isPending: false,
        isError: false,
        error: null,
      },
    };
  }
  return (globalThis as any)[KEY];
}

const shared = getShared();

export const sendEmailReturn = shared.sendEmail;

export interface SendEmailPayload {
  templateCode?: string;
  subject?: string;
  body?: string;
  bodyHtml?: string;
  recipientEmail: string;
  recipientName?: string;
  recipientType?: "USER" | "CARRIER" | "CONTACT" | "DRIVER";
  recipientId?: string;
  entityType?: "LOAD" | "ORDER" | "CARRIER" | "COMPANY";
  entityId?: string;
  variables?: Record<string, unknown>;
  language?: "en" | "es";
  attachments?: Array<{ name: string; url: string; mimeType?: string }>;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
}

export function useSendEmail() {
  return shared.sendEmail;
}

import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { sendEmailReturn } from "@/test/mocks/hooks-communication-send-email";

import {
  EmailPreviewDialog,
  type EmailType,
} from "@/components/tms/emails/email-preview-dialog";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  emailType: "rate_confirmation" as EmailType,
  loadId: "load-1",
  loadNumber: "LD-2026-100",
  recipientEmail: "carrier@example.com",
  recipientName: "Fast Freight",
  recipientType: "CARRIER" as const,
  recipientId: "c1",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("EmailPreviewDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendEmailReturn.mutate = jest.fn();
    sendEmailReturn.isPending = false;
    sendEmailReturn.isError = false;
    sendEmailReturn.error = null;
  });

  it("renders dialog with correct title", () => {
    render(<EmailPreviewDialog {...defaultProps} />);
    expect(screen.getByText("Rate Confirmation")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<EmailPreviewDialog {...defaultProps} />);
    expect(
      screen.getByText(/Preview and send this email/)
    ).toBeInTheDocument();
  });

  it("pre-fills recipient email", () => {
    render(<EmailPreviewDialog {...defaultProps} />);
    const emailInput = screen.getByLabelText(/To/);
    expect(emailInput).toHaveValue("carrier@example.com");
  });

  it("pre-fills subject with load number", () => {
    render(<EmailPreviewDialog {...defaultProps} />);
    const subjectInput = screen.getByLabelText("Subject");
    expect(subjectInput).toHaveValue(
      "Rate Confirmation - Load LD-2026-100"
    );
  });

  it("pre-fills message body with load number", () => {
    render(<EmailPreviewDialog {...defaultProps} />);
    const bodyTextarea = screen.getByLabelText("Message") as HTMLTextAreaElement;
    expect(bodyTextarea.value).toContain("LD-2026-100");
  });

  it("allows editing the subject", async () => {
    const user = userEvent.setup();
    render(<EmailPreviewDialog {...defaultProps} />);
    const subjectInput = screen.getByLabelText("Subject");
    await user.clear(subjectInput);
    await user.type(subjectInput, "Custom Subject");
    expect(subjectInput).toHaveValue("Custom Subject");
  });

  it("allows editing the body", async () => {
    const user = userEvent.setup();
    render(<EmailPreviewDialog {...defaultProps} />);
    const bodyTextarea = screen.getByLabelText("Message");
    await user.clear(bodyTextarea);
    await user.type(bodyTextarea, "Custom body text");
    expect(bodyTextarea).toHaveValue("Custom body text");
  });

  it("calls mutate on Send Email click", async () => {
    const user = userEvent.setup();
    render(<EmailPreviewDialog {...defaultProps} />);
    await user.click(screen.getByText("Send Email"));
    expect(sendEmailReturn.mutate).toHaveBeenCalledTimes(1);
    const callArgs = (sendEmailReturn.mutate as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toMatchObject({
      recipientEmail: "carrier@example.com",
      templateCode: "RATE_CONFIRMATION",
      entityType: "LOAD",
      entityId: "load-1",
    });
  });

  it("disables Send button when isPending", () => {
    sendEmailReturn.isPending = true;
    render(<EmailPreviewDialog {...defaultProps} />);
    const sendBtn = screen.getByText("Send Email").closest("button");
    expect(sendBtn).toBeDisabled();
  });

  it("disables Send button when no recipient email", () => {
    render(
      <EmailPreviewDialog {...defaultProps} recipientEmail="" />
    );
    const sendBtn = screen.getByText("Send Email").closest("button");
    expect(sendBtn).toBeDisabled();
  });

  it("renders Cancel button that calls onOpenChange(false)", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    render(
      <EmailPreviewDialog {...defaultProps} onOpenChange={onOpenChange} />
    );
    await user.click(screen.getByText("Cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders attachments when provided", () => {
    render(
      <EmailPreviewDialog
        {...defaultProps}
        attachments={[
          { name: "rate-con.pdf", url: "/files/rate-con.pdf" },
          { name: "bol.pdf", url: "/files/bol.pdf" },
        ]}
      />
    );
    expect(screen.getByText("rate-con.pdf")).toBeInTheDocument();
    expect(screen.getByText("bol.pdf")).toBeInTheDocument();
  });
});

describe("EmailPreviewDialog — Different Email Types", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendEmailReturn.mutate = jest.fn();
    sendEmailReturn.isPending = false;
  });

  it("renders load tender title", () => {
    render(
      <EmailPreviewDialog
        {...defaultProps}
        emailType="load_tendered"
      />
    );
    expect(screen.getByText("Load Tender Notification")).toBeInTheDocument();
  });

  it("renders pickup reminder title", () => {
    render(
      <EmailPreviewDialog
        {...defaultProps}
        emailType="pickup_reminder"
      />
    );
    expect(screen.getByText("Pickup Reminder")).toBeInTheDocument();
  });

  it("renders delivery confirmation title", () => {
    render(
      <EmailPreviewDialog
        {...defaultProps}
        emailType="delivery_confirmation"
      />
    );
    expect(screen.getByText("Delivery Confirmation")).toBeInTheDocument();
  });

  it("renders invoice email title", () => {
    render(
      <EmailPreviewDialog
        {...defaultProps}
        emailType="invoice_sent"
      />
    );
    expect(screen.getByText("Invoice Email")).toBeInTheDocument();
  });
});

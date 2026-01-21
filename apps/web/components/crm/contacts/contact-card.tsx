import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contact } from "@/lib/types/crm";
import { Badge } from "@/components/ui/badge";

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{contact.fullName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {contact.title || "No title"}
          </p>
        </div>
        {contact.isPrimary ? <Badge>Primary</Badge> : null}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>Email: {contact.email || "—"}</div>
        <div>Phone: {contact.phone || contact.mobile || "—"}</div>
        <div>Status: {contact.isActive ? "Active" : "Inactive"}</div>
      </CardContent>
    </Card>
  );
}

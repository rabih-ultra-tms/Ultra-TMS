import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Contact } from "@/lib/types/crm";

interface ContactSelectProps {
  contacts: Contact[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ContactSelect({
  contacts,
  value,
  onChange,
  placeholder = "Select a contact",
}: ContactSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {contacts.map((contact) => (
          <SelectItem key={contact.id} value={contact.id}>
            {contact.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

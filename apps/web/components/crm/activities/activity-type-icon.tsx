import { Phone, Mail, Calendar, StickyNote, CheckSquare } from "lucide-react";
import type { ActivityType } from "@/lib/types/crm";

interface ActivityTypeIconProps {
  type: ActivityType;
  className?: string;
}

export function ActivityTypeIcon({ type, className }: ActivityTypeIconProps) {
  switch (type) {
    case "CALL":
      return <Phone className={className} />;
    case "EMAIL":
      return <Mail className={className} />;
    case "MEETING":
      return <Calendar className={className} />;
    case "TASK":
      return <CheckSquare className={className} />;
    default:
      return <StickyNote className={className} />;
  }
}

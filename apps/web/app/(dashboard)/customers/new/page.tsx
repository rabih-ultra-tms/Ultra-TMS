import { redirect } from "next/navigation";

export default function NewCustomerRedirectPage() {
  redirect("/companies/new");
}

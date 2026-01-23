import { redirect } from "next/navigation";

export default function CustomerContactsRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/companies/${params.id}/contacts`);
}

import { redirect } from "next/navigation";

export default function CustomerEditRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/companies/${params.id}/edit`);
}

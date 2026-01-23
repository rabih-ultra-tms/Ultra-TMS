import { redirect } from "next/navigation";

export default function CustomerActivitiesRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/companies/${params.id}/activities`);
}

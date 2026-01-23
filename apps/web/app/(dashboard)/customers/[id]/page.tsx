import { redirect } from "next/navigation";

export default function CustomerDetailRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/companies/${params.id}`);
}

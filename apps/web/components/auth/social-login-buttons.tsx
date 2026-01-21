import { Button } from "@/components/ui/button";

export function SocialLoginButtons() {
  return (
    <div className="grid gap-2">
      <Button variant="outline">Continue with Google</Button>
      <Button variant="outline">Continue with Microsoft</Button>
    </div>
  );
}

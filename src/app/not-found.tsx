import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-lg text-muted-foreground">
            The page you&#39;re looking for doesn&#39;t exist or has been moved.
          </p>
        </div>
        <Link href="/">
          <Button size="lg">Go to Homepage</Button>
        </Link>
      </div>
    </div>
  );
}

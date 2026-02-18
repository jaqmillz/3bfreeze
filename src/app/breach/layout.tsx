import Link from "next/link";
import { Shield } from "lucide-react";
import { Footer } from "@/components/footer";

export default function BreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-primary text-white">
        <div className="flex h-12 items-center justify-center px-4">
          <Link href="/breach" className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-bold">3Bfreeze</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

import { InfoPageShell } from "@/components/info-page-shell";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact - 3Bfreeze",
  description: "Get in touch with the 3Bfreeze team.",
};

export default function ContactPage() {
  return (
    <InfoPageShell>
      <ContactForm />
    </InfoPageShell>
  );
}

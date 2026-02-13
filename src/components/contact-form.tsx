"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setStatus("loading");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("contact_submissions").insert({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
      });

      if (error) throw error;

      setStatus("success");
      toast.success("Message sent successfully!");
    } catch {
      setStatus("error");
      toast.error("Something went wrong. Please try again.");
    }
  }

  function handleReset() {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setStatus("idle");
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-center text-3xl font-bold tracking-tight">
        Get in Touch
      </h1>
      <p className="mt-3 text-center text-muted-foreground">
        Have a question, found a bug, or want to partner with us?
      </p>

      <Card className="mt-8">
        <CardContent className="pt-6">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">Message Sent</h3>
              <p className="text-muted-foreground">
                We&#39;ll get back to you within 1-2 business days.
              </p>
              <Button variant="outline" onClick={handleReset}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === "loading"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={subject}
                  onValueChange={setSubject}
                  disabled={status === "loading"}
                  required
                >
                  <SelectTrigger id="subject" className="w-full">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Inquiry">
                      General Inquiry
                    </SelectItem>
                    <SelectItem value="Bug Report">Bug Report</SelectItem>
                    <SelectItem value="Partnership Inquiry">
                      Partnership Inquiry
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us what's on your mind..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={status === "loading"}
                  rows={5}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

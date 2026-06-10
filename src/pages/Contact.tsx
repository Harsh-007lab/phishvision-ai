import { useState } from "react";
import { LegalLayout } from "@/components/LegalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Shield, Briefcase, Send } from "lucide-react";
import { toast } from "sonner";

const contactCards = [
  {
    icon: Mail,
    title: "General",
    email: "hello@phishvision.ai",
    description: "Questions, feedback, or anything else.",
  },
  {
    icon: Shield,
    title: "Security",
    email: "security@phishvision.ai",
    description: "Report a vulnerability or security concern.",
  },
  {
    icon: Briefcase,
    title: "Business / API",
    email: "business@phishvision.ai",
    description: "Partnerships, bulk licensing, and API access.",
  },
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Please fill out every field before submitting.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      toast.success("Thanks! We've received your message and will reply within 1 business day.");
    }, 600);
  };

  return (
    <LegalLayout
      title="Get in touch"
      subtitle="We typically respond within 1 business day."
    >
      <div className="grid gap-4 sm:grid-cols-3 not-prose">
        {contactCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <a
                  href={`mailto:${c.email}`}
                  className="text-sm font-medium text-primary hover:underline break-all"
                >
                  {c.email}
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-card/40 backdrop-blur-sm not-prose">
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Choose a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="security">Security Report</SelectItem>
                  <SelectItem value="api">API Access</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                rows={6}
              />
            </div>

            <Button type="submit" disabled={submitting} className="gap-2">
              <Send className="w-4 h-4" />
              {submitting ? "Sending..." : "Send message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </LegalLayout>
  );
};

export default Contact;
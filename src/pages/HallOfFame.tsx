import { LegalLayout } from "@/components/LegalLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award } from "lucide-react";

const HallOfFame = () => (
  <LegalLayout
    title="Security Researchers We Thank"
    subtitle="Public acknowledgement of researchers who have responsibly disclosed vulnerabilities."
  >
    <p>
      We are grateful to the security community for helping keep PhishVision AI safe. Researchers listed below have
      responsibly disclosed a verified vulnerability under our{" "}
      <a href="/security-policy">security policy</a>.
    </p>

    <div className="rounded-lg border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Researcher</TableHead>
            <TableHead>Vulnerability Type</TableHead>
            <TableHead>Date Acknowledged</TableHead>
            <TableHead>Severity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="text-center py-12">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Award className="w-10 h-10 opacity-50" />
                <p>
                  No researchers have been acknowledged yet — be the first to{" "}
                  <a href="/security-policy" className="text-primary underline">
                    responsibly disclose a vulnerability
                  </a>
                  .
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </LegalLayout>
);

export default HallOfFame;
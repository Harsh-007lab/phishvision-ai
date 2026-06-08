import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: "guest" | "free";
}

export const ScanLimitModal = ({ open, onOpenChange, tier }: Props) => {
  const isGuest = tier === "guest";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isGuest ? "You've used your 5 free scans today" : "Daily scan limit reached"}
          </DialogTitle>
          <DialogDescription>
            {isGuest
              ? "Sign up for a free account to get 20 scans/day — or upgrade to Pro for unlimited."
              : "Free accounts get 20 scans/day. Upgrade to Pro for unlimited scans."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isGuest && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/signup">Sign up free</Link>
            </Button>
          )}
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard">Upgrade to Pro</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface GuestPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GuestSignupPrompt = ({ open, onOpenChange }: GuestPromptProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="glass max-w-md">
      <DialogHeader>
        <DialogTitle>Save your scan history</DialogTitle>
        <DialogDescription>
          Sign up free to save unlimited scan history, get 20 scans/day, and access a personal dashboard.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Maybe later</Button>
        <Button asChild>
          <Link to="/signup">Sign up free</Link>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
import { Button } from "@/components/ui/button";
import { ArrowRight, Chrome } from "lucide-react";
import { Link } from "react-router-dom";

export const FinalCTA = () => {
  const scrollToScanner = () => {
    const el = document.getElementById("scanner");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="w-full px-4 py-16">
      <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/40 to-accent/15 backdrop-blur-md p-8 sm:p-14 text-center">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Protect yourself and your team —{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              for free
            </span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Scan your first URL in 30 seconds. No account required. No credit card. No tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button
              size="lg"
              onClick={scrollToScanner}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 gap-2"
            >
              Scan a URL Now <ArrowRight className="w-4 h-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/chrome-extension">
                <Chrome className="w-4 h-4" /> Install Chrome Extension
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
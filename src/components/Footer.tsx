import { Link } from "react-router-dom";

const links = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Security", to: "/security-policy" },
  { label: "API Docs", to: "/api" },
  { label: "Contact", to: "/contact" },
];

export const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/40 mt-12 bg-background/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 md:grid-cols-3 items-center text-sm">
        <p className="text-muted-foreground text-center md:text-left">
          © 2026 PhishVision AI. All rights reserved.
        </p>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          {links.map((link, idx) => (
            <span key={link.to} className="flex items-center gap-3">
              <Link
                to={link.to}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
              {idx < links.length - 1 && (
                <span aria-hidden="true" className="text-muted-foreground/40">
                  ·
                </span>
              )}
            </span>
          ))}
        </nav>

        <p className="text-muted-foreground text-center md:text-right">
          Built for security-conscious individuals and teams.
        </p>
      </div>
    </footer>
  );
};
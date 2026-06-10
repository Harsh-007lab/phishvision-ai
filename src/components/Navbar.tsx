import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/UserMenu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", to: "/#features" },
  { label: "Pricing", to: "/pricing" },
  { label: "API", to: "/api" },
  { label: "Blog", to: "/blog" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const Logo = (
    <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
        <Shield className="w-4 h-4 text-primary-foreground" />
      </span>
      <span className="text-lg font-bold tracking-tight">
        PhishVision<span className="text-accent">AI</span>
      </span>
    </Link>
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          {Logo}

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Log in
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20"
                  onClick={() => navigate("/signup")}
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden p-2 rounded-md hover:bg-muted/50"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] md:hidden bg-background/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-border/40">
              {Logo}
              <button
                type="button"
                aria-label="Close menu"
                className="p-2 rounded-md hover:bg-muted/50"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col items-center justify-center gap-2 px-6">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center text-2xl font-semibold py-3 text-foreground/90 hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="w-full mt-8 flex flex-col gap-3">
                {user ? (
                  <div className="flex justify-center">
                    <UserMenu />
                  </div>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/login");
                      }}
                    >
                      Log in
                    </Button>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/signup");
                      }}
                    >
                      Get Started Free
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
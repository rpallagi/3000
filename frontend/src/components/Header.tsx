import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isHome = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (hash: string) => {
    setMenuOpen(false);
    if (isHome) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-lg sm:text-xl font-semibold text-foreground tracking-tight hover:opacity-80 transition-opacity"
        >
          Play<span className="text-primary">ENG</span>
        </button>
        <nav className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => handleNavClick("levels")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Szintek
          </button>
          <button
            onClick={() => handleNavClick("method")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Módszer
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            title={resolvedTheme === "dark" ? "Világos mód" : "Sötét mód"}
          >
            {resolvedTheme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 sm:pl-3 sm:pr-4 py-2 bg-card border border-border rounded-full hover:bg-accent transition-colors"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-56 bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {user.isPremium && (
                        <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Premium
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { navigate("/tutor"); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-3"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                      AI Tutor
                    </button>
                    {!user.isPremium && (
                      <button
                        onClick={() => { navigate("/subscription"); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-primary font-medium hover:bg-accent transition-colors flex items-center gap-3"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>
                        Premium
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                      className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:bg-accent transition-colors border-t border-border"
                    >
                      Kijelentkezés
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 sm:px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Belépés
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

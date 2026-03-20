import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { isSilent, setSoundMode } from "@/utils/settings";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [silent, setSilent] = useState(isSilent());

  const toggleSoundMode = () => {
    const newMode = silent ? "normal" : "silent";
    setSoundMode(newMode);
    setSilent(newMode === "silent");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-lg sm:text-xl font-semibold text-foreground tracking-tight hover:opacity-80 transition-opacity"
        >
          <img src="/owl-logo.svg" alt="" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span style={{ color: "#4CAF50" }}>play</span><span className="font-bold" style={{ color: "#E91E63" }}>ENG</span>
        </button>
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Sound/Silent mode toggle */}
          <button
            onClick={toggleSoundMode}
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            title={silent ? "Hangos mód" : "Néma mód"}
          >
            {silent ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
                <line x1="23" x2="17" y1="9" y2="15"/>
                <line x1="17" x2="23" y1="9" y2="15"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            )}
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
                className="flex items-center gap-2 pl-2 pr-3 py-2 bg-card border border-border rounded-full hover:bg-accent transition-colors"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
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
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-3"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Profilom
                    </button>
                    <button
                      onClick={() => { navigate("/error-dictionary"); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-3"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                      Hibaszótár
                    </button>
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
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

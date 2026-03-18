import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleNavClick = (hash: string) => {
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
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-semibold text-foreground tracking-tight hover:opacity-80 transition-opacity"
        >
          Play<span className="text-primary">ENG</span>
        </button>
        <nav className="flex items-center gap-6">
          <button
            onClick={() => handleNavClick("levels")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Szintek
          </button>
          <button
            onClick={() => handleNavClick("method")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Módszer
          </button>
          <button
            onClick={() => navigate("/level/1")}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Kezdés
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

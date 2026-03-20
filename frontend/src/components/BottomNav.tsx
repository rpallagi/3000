import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { getDueCount } from "@/utils/sm2";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dueCount = getDueCount();

  const items: NavItem[] = [
    {
      path: "/",
      label: "Tanulás",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      path: "/review",
      label: "Ismétlés",
      badge: dueCount > 0 ? dueCount : undefined,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      ),
    },
    {
      path: "/vocabulary",
      label: "Szószedet",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <line x1="12" y1="6" x2="12" y2="13" />
          <line x1="9" y1="10" x2="15" y2="10" />
        </svg>
      ),
    },
    {
      path: "/profile",
      label: "Profil",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  // Don't show on certain pages
  const hiddenPaths = ["/onboarding", "/login"];
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) return null;
  // Don't show during practice/lesson
  if (location.pathname.includes("/practice") || location.pathname.includes("/lesson/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-bottom">
      <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/" || location.pathname === "/units"
            : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[60px] transition-colors"
            >
              <div className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
              {item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {item.badge > 9 ? "9+" : item.badge}
                </motion.span>
              )}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { getStreak, getErrorWords } from "@/utils/progress";
import { getAllItems, getDueCount } from "@/utils/sm2";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const streak = getStreak();
  const errorWords = getErrorWords();
  const sm2Items = getAllItems();
  const dueCount = getDueCount();

  const totalTracked = sm2Items.length;
  const masteredCount = sm2Items.filter((i) => i.repetitions >= 4).length;
  const errorCount = Object.keys(errorWords).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-14 h-14 rounded-full" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {user?.name || "Tanuló"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user?.email || "Vendég mód"}
            </p>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard label="Sorozat" value={`${streak} nap`} color="#FF9800" />
          <StatCard label="Ismétlendő" value={`${dueCount} szó`} color="#E91E63" />
          <StatCard label="Követett szavak" value={`${totalTracked}`} color="#4CAF50" />
          <StatCard label="Elsajátított" value={`${masteredCount}`} color="#1565C0" />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {dueCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/review")}
              className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-3 text-left hover:border-primary/30 transition-all"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#E91E6320" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E91E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{dueCount} szó ismétlésre vár</p>
                <p className="text-xs text-muted-foreground">Indítsd el a napi ismétlést!</p>
              </div>
            </motion.button>
          )}

          <button
            onClick={() => navigate("/error-dictionary")}
            className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-3 text-left hover:border-foreground/20 transition-all"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M3.6 9h16.8" />
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Hibaszótár</p>
              <p className="text-xs text-muted-foreground">{errorCount} szóban hibáztál</p>
            </div>
          </button>

          {!user && (
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-3 text-left hover:border-foreground/20 transition-all"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Bejelentkezés</p>
                <p className="text-xs text-muted-foreground">Mentsd el a haladásodat</p>
              </div>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            PlayENG v4.2 — Magyaroknak fejlesztettük
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <button onClick={() => navigate("/terms")} className="text-[10px] text-muted-foreground hover:text-foreground">ÁSZF</button>
            <button onClick={() => navigate("/privacy")} className="text-[10px] text-muted-foreground hover:text-foreground">Adatvédelem</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-2xl border border-border p-4 text-center"
    style={{ boxShadow: "var(--card-shadow)" }}
  >
    <p className="text-xl font-bold" style={{ color }}>{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </motion.div>
);

export default ProfilePage;

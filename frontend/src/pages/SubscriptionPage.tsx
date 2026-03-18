import { useState } from "react";
import { useAuth, authHeaders } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { motion } from "framer-motion";

const SubscriptionPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const status = searchParams.get("status");

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Hiba történt");
        return;
      }

      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch {
      alert("A fizetési szolgáltatás nem elérhető");
    } finally {
      setLoading(false);
    }
  };

  // Returning from payment
  if (status === "SUCCESS") {
    refreshUser();
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen px-6 pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Sikeres fizetés!</h1>
            <p className="text-muted-foreground mb-8">
              Premium hozzáférésed aktiválva. Minden szint és az AI tutor elérhető!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium"
            >
              Kezdjük el!
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-screen px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Premium csomag
            </h1>
            <p className="text-muted-foreground">
              Teljes hozzáférés minden funkcióhoz
            </p>
          </div>

          {/* Free tier */}
          <div className="p-6 bg-card rounded-3xl border border-border mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Ingyenes</h3>
              <span className="text-2xl font-bold text-foreground">0 Ft</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Level 1 — Alapok (4 fejezet)
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                4 feladattípus
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Haladás nyomon követése
              </li>
            </ul>
          </div>

          {/* Premium tier */}
          <div className="p-6 bg-card rounded-3xl border-2 border-primary mb-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full">
              Ajánlott
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Premium</h3>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">2 990 Ft</span>
                <span className="text-sm text-muted-foreground">/hó</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ea3f2" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-foreground font-medium">Mind a 6 szint (973 szó)</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ea3f2" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-foreground font-medium">AI nyelvi tutor</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ea3f2" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Gyenge pontok elemzése
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ea3f2" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Kiejtés visszajelzés AI-val
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ea3f2" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Eszközök közötti szinkronizálás
              </li>
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading || (user?.isPremium ?? false)}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {user?.isPremium
                ? "Aktív Premium"
                : loading
                ? "Átirányítás..."
                : "Előfizetés SimplePay-jel"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            A fizetés az OTP SimplePay rendszerén keresztül történik.
            Bármikor lemondható.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPage;

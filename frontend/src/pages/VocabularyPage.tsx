import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { fetchVocabulary, VocabularyItem } from "@/utils/api";
import { speak } from "@/utils/tts";
import { isSilent } from "@/utils/settings";

const VocabularyPage = () => {
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [sortBy, setSortBy] = useState<"alpha" | "unit">("unit");

  useEffect(() => {
    setLoading(true);
    fetchVocabulary({ q: search || undefined, unit: unitFilter || undefined, sort: sortBy })
      .then(setWords)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, unitFilter, sortBy]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-foreground mb-4">Szószedet</h1>

        {/* Search */}
        <div className="relative mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Keresés magyarul vagy angolul..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Sort toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortBy("alpha")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "alpha" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            A-Z
          </button>
          <button
            onClick={() => setSortBy("unit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "unit" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            Egység
          </button>
        </div>

        {/* Word count */}
        <p className="text-xs text-muted-foreground mb-3">
          {words.length} szó {search ? `"${search}" keresésre` : "összesen"}
        </p>

        {/* Word list */}
        {loading ? (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-center text-muted-foreground py-12"
          >
            Betöltés...
          </motion.div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "var(--card-shadow)" }}>
            {words.slice(0, 100).map((word, i) => (
              <button
                key={word.id}
                onClick={() => { if (!isSilent()) speak(word.word); }}
                className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-primary/5 transition-colors ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0"
                    style={{ background: "#4CAF50", minWidth: 24, textAlign: "center" }}>
                    {word.unitId}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground block truncate">{word.word}</span>
                    <span className="text-xs text-muted-foreground">{word.pos}</span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground flex-shrink-0 ml-2 truncate max-w-[40%] text-right">
                  {word.hungarian}
                </span>
              </button>
            ))}
            {words.length > 100 && (
              <div className="px-4 py-3 border-t border-border text-center">
                <span className="text-xs text-muted-foreground">
                  + {words.length - 100} további szó (szűkítsd a keresést)
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyPage;

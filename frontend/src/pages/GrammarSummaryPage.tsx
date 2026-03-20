import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { fetchUnits, fetchGrammarSearch, UnitData, GrammarData } from "@/utils/api";

const COLOR_MAP: Record<string, string> = {
  pink: "#E91E63",
  green: "#4CAF50",
  blue: "#1565C0",
  orange: "#FF9800",
};

const GrammarSummaryPage = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<{ unitId: string; unitTitle: string; grammar: GrammarData }[] | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [unitGrammars, setUnitGrammars] = useState<Map<string, GrammarData>>(new Map());

  useEffect(() => {
    fetchUnits()
      .then((data) => {
        setUnits(data);
        // Load grammar for all units
        Promise.all(
          data.map(async (u) => {
            try {
              const res = await fetch(`/api/units/${u.id}/grammar`);
              if (res.ok) {
                const grammar = await res.json();
                return [u.id, grammar] as [string, GrammarData];
              }
            } catch {}
            return null;
          })
        ).then((results) => {
          const map = new Map<string, GrammarData>();
          for (const r of results) {
            if (r) map.set(r[0], r[1]);
          }
          setUnitGrammars(map);
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(() => {
      fetchGrammarSearch(searchInput)
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const displayUnits = searchResults !== null
    ? units.filter((u) => searchResults.some((r) => r.unitId === u.id))
    : units;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-foreground mb-4">Nyelvtani összefoglaló</h1>

        {/* Search — Greta spec: magyar + angol keresés */}
        <div className="relative mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder='Keresés: "can", "múlt idő", "present"...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {searchResults !== null && searchResults.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nincs találat: „{searchInput}"
          </p>
        )}

        {loading ? (
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-center text-muted-foreground py-12">
            Betöltés...
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayUnits.map((unit) => {
              const grammar = unitGrammars.get(unit.id);
              const isExpanded = expandedUnit === unit.id;
              const borderColor = COLOR_MAP[unit.color] || "#4CAF50";

              return (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                  style={{ borderLeftWidth: 4, borderLeftColor: borderColor, boxShadow: "var(--card-shadow)" }}
                >
                  {/* Header — clickable */}
                  <button
                    onClick={() => setExpandedUnit(isExpanded ? null : unit.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md text-white" style={{ background: borderColor }}>
                        {unit.id}
                      </span>
                      <span className="text-sm font-medium text-foreground">{unit.title}</span>
                    </div>
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-muted-foreground text-sm"
                    >
                      ▼
                    </motion.span>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && grammar && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 border-t border-border"
                    >
                      {/* Basic rule */}
                      <div className="mt-3 mb-3">
                        <h4 className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#4CAF50" }}>
                          Alapszabály
                        </h4>
                        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                          {grammar.ruleBasic}
                        </p>
                      </div>

                      {/* Extra rule */}
                      {grammar.ruleExtra && (
                        <div className="mb-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Kivételek</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 whitespace-pre-line">
                            {grammar.ruleExtra}
                          </p>
                        </div>
                      )}

                      {/* Examples */}
                      {grammar.examples?.length > 0 && (
                        <div className="flex flex-col gap-2 mb-3">
                          {grammar.examples.map((ex, i) => (
                            <div key={i} className="bg-surface-subtle rounded-lg p-3">
                              <p className="text-sm font-medium text-foreground">{ex.en}</p>
                              <p className="text-xs text-muted-foreground">{ex.hu}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Practice button */}
                      <button
                        onClick={() => navigate(`/unit/${unit.id}/lesson/1/practice?startTask=4`)}
                        className="text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                        style={{ background: `${borderColor}15`, color: borderColor }}
                      >
                        Gyakorolj
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarSummaryPage;

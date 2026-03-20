import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  title: string;
}

/**
 * Book Mode Modal (📖 Könyv mód)
 * Greta spec: PNG pages from textbook, pageable modal
 * When actual PNG pages are available, they'll be loaded from:
 *   /api/units/{unitId}/book-pages
 * For now, shows the grammar content in a book-style layout.
 */
const BookModal = ({ isOpen, onClose, unitId, title }: Props) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Placeholder pages — will be replaced with actual PNGs from Greta's books
  const pages = [
    {
      title: `${unitId} — ${title}`,
      content: "A könyvoldal PNG-k feltöltés alatt vannak. Gréta fogja előkészíteni az Okoskönyv oldalakat ehhez az egységhez.",
      note: "Minden egységhez ~2-3 könyvoldal tartozik, ami a nyelvtani szabályt magyarázza el részletesen.",
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 w-full max-w-lg max-h-[80vh] bg-card rounded-3xl border border-border overflow-hidden flex flex-col"
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span className="text-sm font-semibold text-foreground">Könyv mód</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {pages[currentPage].title}
                </h3>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800 mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    {pages[currentPage].content}
                  </p>
                </div>
                {pages[currentPage].note && (
                  <p className="text-xs text-muted-foreground italic">
                    {pages[currentPage].note}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer with pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Előző
            </button>
            <span className="text-xs text-muted-foreground">
              {currentPage + 1} / {pages.length}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
              disabled={currentPage === pages.length - 1}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Következő
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookModal;

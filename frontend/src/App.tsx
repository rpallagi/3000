import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index.tsx";
import LevelPage from "./pages/LevelPage.tsx";
import ChapterPage from "./pages/ChapterPage.tsx";
import LessonPage from "./pages/LessonPage.tsx";
import PracticePage from "./pages/PracticePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SubscriptionPage from "./pages/SubscriptionPage.tsx";
import TutorPage from "./pages/TutorPage.tsx";
import ErrorDictionaryPage from "./pages/ErrorDictionaryPage.tsx";
import DailyChallengePage from "./pages/DailyChallengePage.tsx";
import ChapterTestPage from "./pages/ChapterTestPage.tsx";
import WeakWordsPracticePage from "./pages/WeakWordsPracticePage.tsx";
import TermsPage from "./pages/TermsPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import NotFound from "./pages/NotFound.tsx";
// V4 unit-based pages
import UnitListPage from "./pages/UnitListPage.tsx";
import UnitPage from "./pages/UnitPage.tsx";
import UnitLessonPage from "./pages/UnitLessonPage.tsx";
import UnitPracticePage from "./pages/UnitPracticePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<UnitListPage />} />
              <Route path="/home" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/tutor" element={<TutorPage />} />
              <Route path="/level/:levelId" element={<LevelPage />} />
              <Route path="/chapter/:chapterId" element={<ChapterPage />} />
              <Route path="/chapter/:chapterId/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/chapter/:chapterId/lesson/:lessonId/practice" element={<PracticePage />} />
              <Route path="/chapter/:chapterId/test" element={<ChapterTestPage />} />
              <Route path="/error-dictionary" element={<ErrorDictionaryPage />} />
              <Route path="/daily" element={<DailyChallengePage />} />
              <Route path="/weak-words-practice" element={<WeakWordsPracticePage />} />
              {/* V4 unit-based routes */}
              <Route path="/units" element={<UnitListPage />} />
              <Route path="/unit/:unitId" element={<UnitPage />} />
              <Route path="/unit/:unitId/lesson/:lessonId" element={<UnitLessonPage />} />
              <Route path="/unit/:unitId/lesson/:lessonId/practice" element={<UnitPracticePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

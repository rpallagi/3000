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
import NotFound from "./pages/NotFound.tsx";

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
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/tutor" element={<TutorPage />} />
              <Route path="/level/:levelId" element={<LevelPage />} />
              <Route path="/chapter/:chapterId" element={<ChapterPage />} />
              <Route path="/chapter/:chapterId/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/chapter/:chapterId/lesson/:lessonId/practice" element={<PracticePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './features/Layout/AppLayout.jsx';
import { HomePage } from './features/Home/HomePage.jsx';
import { HikesPage } from './features/Hikes/HikesPage.jsx';
import { HikeDetailPage } from './features/Hikes/HikeDetailPage.jsx';
import { PlannerPage } from './features/Planner/PlannerPage.jsx';
import { QuizPage } from './features/Quiz/QuizPage.jsx';
import { RecipesPage } from './features/Recipes/RecipesPage.jsx';
import { MealsPage } from './features/Meals/MealsPage.jsx';
import { BackpacksPage } from './features/Backpacks/BackpacksPage.jsx';
import { LoginPage } from './features/Auth/LoginPage.jsx';
import { NotFoundPage } from './features/Common/NotFoundPage.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="itineraires" element={<HikesPage />} />
        <Route path="itineraires/:slug" element={<HikeDetailPage />} />
        <Route path="planifier" element={<PlannerPage />} />
        <Route path="bivouac" element={<QuizPage />} />
        <Route path="recettes" element={<RecipesPage />} />
        <Route path="plats" element={<MealsPage />} />
        <Route path="sacs" element={<BackpacksPage />} />
        <Route path="connexion" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

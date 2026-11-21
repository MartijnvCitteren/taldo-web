import { Navigate, Route, Routes } from 'react-router-dom';
import { OnboardingPage } from '../pages/onboarding';
import { VacancyCreatePage } from '../pages/vacancy-create';
import { RequireOnboarding } from './RequireOnboarding';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/vacancies/new" replace />} />
      <Route
        path="/vacancies/new"
        element={
          <RequireOnboarding>
            <VacancyCreatePage />
          </RequireOnboarding>
        }
      />
      {/* The last sign-up step, after the Keycloak pages: outside the app shell, no navigation yet. */}
      <Route path="/onboarding" element={<OnboardingPage />} />
    </Routes>
  );
}

import { Navigate, Route, Routes } from 'react-router';

import { HomePage } from '../pages/HomePage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

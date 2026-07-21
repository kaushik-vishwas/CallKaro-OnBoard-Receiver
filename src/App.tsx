import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {OnboardingPage} from './pages/Onboarding/OnboardingPage';
import {VideoPage} from './pages/Video/VideoPage';
import {StatusPage} from './pages/Status/StatusPage';
import {InvalidLinkPage} from './pages/InvalidLink/InvalidLinkPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Link format agents share from the panel */}
        <Route path="/useregistration/:slug" element={<OnboardingPage />} />
        <Route path="/useregistration/:slug/video" element={<VideoPage />} />
        <Route path="/useregistration/:slug/status" element={<StatusPage />} />
        <Route
          path="/useregistration/:slug/submitted"
          element={<StatusPage />}
        />

        {/* Legacy / direct token links */}
        <Route path="/onboard/:token" element={<OnboardingPage />} />
        <Route path="/onboard/:token/video" element={<VideoPage />} />
        <Route path="/onboard/:token/status" element={<StatusPage />} />
        <Route path="/onboard/:token/submitted" element={<StatusPage />} />

        <Route path="/invalid-link" element={<InvalidLinkPage />} />
        <Route path="/" element={<Navigate to="/invalid-link" replace />} />
        <Route path="*" element={<Navigate to="/invalid-link" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

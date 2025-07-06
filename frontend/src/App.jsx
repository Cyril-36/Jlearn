import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ChallengeWorkspace from "./components/ChallengeWorkspace";
import { AppProvider } from "./contexts/AppContext";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/challenge/:id/*" element={<ChallengeWorkspace />} />
          {/* Optional: 404 fallback */}
          <Route
            path="*"
            element={<div className="text-white p-6">404: Page Not Found</div>}
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.jsx';
import LandingPage from './components/LandingPage.jsx';
import ChallengeWorkspace from './components/ChallengeWorkspace.jsx';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/challenge/:id" element={<ChallengeWorkspace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

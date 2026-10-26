import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StockExplorerPage from './pages/StockExplorerPage';
import PredictionStudioPage from './pages/PredictionStudioPage';
import ModelComparisonPage from './pages/ModelComparisonPage';
import TechnicalAnalysisPage from './pages/TechnicalAnalysisPage';
import WatchlistPage from './pages/WatchlistPage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import AboutAiPage from './pages/AboutAiPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import DocumentationPage from './pages/DocumentationPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#080b11] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/stocks" element={<StockExplorerPage />} />
              <Route path="/stocks/:symbol" element={<StockExplorerPage />} />
              <Route path="/predict" element={<PredictionStudioPage />} />
              <Route path="/models" element={<ModelComparisonPage />} />
              <Route path="/technicals" element={<TechnicalAnalysisPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/history" element={<PredictionHistoryPage />} />
              <Route path="/about-ai" element={<AboutAiPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

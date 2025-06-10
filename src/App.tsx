import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import { Analytics } from './pages/Analytics';
import { NotFound } from './pages/NotFound';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { KPIDetails } from './pages/analytics/KPIDetails';
import { FinancialDetails } from './pages/analytics/FinancialDetails';
import { QualityDetails } from './pages/analytics/QualityDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/kpi" element={<KPIDetails />} />
            <Route path="/analytics/financial" element={<FinancialDetails />} />
            <Route path="/analytics/quality" element={<QualityDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

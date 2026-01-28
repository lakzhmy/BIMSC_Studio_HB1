import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import {
  Dashboard,
  KPIDashboard,
  MeetingsPage,
  ActionsPage,
  Viewer3DPage,
  TeamsPage,
} from './pages';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'kpi':
        return <KPIDashboard />;
      case 'meetings':
        return <MeetingsPage />;
      case 'actions':
        return <ActionsPage />;
      case '3d-viewer':
        return <Viewer3DPage />;
      case 'teams':
        return <TeamsPage />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;

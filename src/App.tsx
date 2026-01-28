import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { KPIDashboard } from './pages/KPIDashboard';
import { PlaceholderPage } from './pages/PlaceholderPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'kpi':
        return <KPIDashboard />;
      case 'meetings':
        return (
          <PlaceholderPage
            title="Meetings"
            description="View and manage team meetings, meeting notes, and outcomes."
          />
        );
      case 'actions':
        return (
          <PlaceholderPage
            title="Action Items"
            description="Track action items across all teams with a Kanban-style board."
          />
        );
      case '3d-viewer':
        return (
          <PlaceholderPage
            title="3D Viewer"
            description="View and interact with 3D models via Speckle integration."
          />
        );
      case 'teams':
        return (
          <PlaceholderPage
            title="Teams"
            description="Manage team members and view team-specific dashboards."
          />
        );
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

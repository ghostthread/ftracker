import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage    from './pages/DashboardPage';
import AnalyticsPage    from './pages/AnalyticsPage';
import TransactionsPage from './pages/TransactionsPage';
import ExpensesPage     from './pages/ExpensesPage';
import ReportsPage      from './pages/ReportsPage';
import BudgetsPage      from './pages/BudgetsPage';
import SettingsPage     from './pages/SettingsPage';
import HelpPage         from './pages/HelpPage';

function AppContent() {
  const { loading } = useProfile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your expenses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header searchQuery={searchQuery} onSearch={setSearchQuery} />

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Routes>
            <Route path="/"             element={<DashboardPage    searchQuery={searchQuery} />} />
            <Route path="/analytics"    element={<AnalyticsPage />} />
            <Route path="/transactions" element={<TransactionsPage globalSearch={searchQuery} />} />
            <Route path="/expenses"     element={<ExpensesPage />} />
            <Route path="/reports"      element={<ReportsPage />} />
            <Route path="/budgets"      element={<BudgetsPage />} />
            <Route path="/settings"    element={<SettingsPage />} />
            <Route path="/help"        element={<HelpPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </BrowserRouter>
  );
}

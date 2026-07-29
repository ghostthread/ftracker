import StatCards from '../components/StatCards';
import SpendTrendChart from '../components/RevenueChart';
import CategoryChart from '../components/TrafficChart';
import BudgetChart from '../components/BudgetChart';
import SpendHeatmap from '../components/SpendHeatmap';
import ExpenseTable from '../components/TransactionTable';

const now = new Date();
const todayLabel = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

export default function DashboardPage({ searchQuery }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">My Expenses</h1>
          <p className="text-xs text-slate-400 mt-0.5">{monthLabel} · logged via Alexa "North Star"</p>
        </div>
        <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium">
          {todayLabel}
        </span>
      </div>
      <StatCards />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <SpendTrendChart />
        <CategoryChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <BudgetChart />
        <SpendHeatmap />
      </div>
      <ExpenseTable globalSearch={searchQuery} />
    </div>
  );
}

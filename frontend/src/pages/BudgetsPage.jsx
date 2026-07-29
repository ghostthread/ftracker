import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { useProfile } from '../context/ProfileContext';

export default function BudgetsPage() {
  const { budgets, categorySpend, updateBudget } = useProfile();
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');

  const startEdit = (id, val) => { setEditing(id); setEditVal(String(val)); };
  const cancelEdit = () => { setEditing(null); setEditVal(''); };
  const saveEdit = (id) => {
    const v = Number(editVal);
    if (v > 0) { updateBudget(id, v); }
    setEditing(null);
  };

  const spendMap = Object.fromEntries(categorySpend.map(c => [c.id, c.amount]));

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSpent  = Object.values(spendMap).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Budgets</h1>
          <p className="text-xs text-slate-400 mt-0.5">Set and track monthly limits per category</p>
        </div>
        <div className="flex gap-3 text-xs">
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600">
            Total budget <span className="font-bold text-slate-900 ml-1">₹{totalBudget.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600">
            Spent so far <span className="font-bold text-slate-900 ml-1">₹{totalSpent.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => {
          const budget = budgets[cat.id];
          const spent  = spendMap[cat.id] ?? 0;
          const pct    = Math.min(100, (spent / budget) * 100);
          const over   = spent > budget;
          const remaining = budget - spent;

          return (
            <div key={cat.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3
                hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-sm font-semibold text-slate-800">{cat.label}</span>
                </div>
                {editing === cat.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">₹</span>
                    <input
                      type="number"
                      value={editVal}
                      autoFocus
                      onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') cancelEdit(); }}
                      className="w-20 px-2 py-1 text-xs border border-indigo-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button onClick={() => saveEdit(cat.id)} className="text-emerald-600 hover:text-emerald-700">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(cat.id, budget)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>₹{budget.toLocaleString('en-IN')}</span>
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: over ? '#f43f5e' : cat.color }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[11px]">
                  <span className={over ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                    ₹{spent.toLocaleString('en-IN')} spent
                  </span>
                  <span className={over ? 'text-rose-500 font-semibold' : 'text-slate-400'}>
                    {over
                      ? `₹${Math.abs(remaining).toLocaleString('en-IN')} over`
                      : `₹${remaining.toLocaleString('en-IN')} left`}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span className={`self-start inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold
                ${pct >= 100 ? 'bg-rose-100 text-rose-700' :
                  pct >= 80  ? 'bg-amber-100 text-amber-700' :
                               'bg-emerald-100 text-emerald-700'}`}
              >
                {pct >= 100 ? `Over budget · ${pct.toFixed(0)}%` :
                 pct >= 80  ? `Warning · ${pct.toFixed(0)}%` :
                              `On track · ${pct.toFixed(0)}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

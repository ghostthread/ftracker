import { useState } from 'react';
import { Mic, CheckCircle, PlusCircle } from 'lucide-react';
import { CATEGORIES, categoryMap } from '../data/mockData';
import { useProfile } from '../context/ProfileContext';

export default function ExpensesPage() {
  const { expenses, addExpense } = useProfile();
  const [form, setForm] = useState({ amount: '', category: 'FOOD', note: '', date: new Date().toISOString().slice(0, 10) });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.note) return;

    await addExpense({
      amount: Number(form.amount),
      category: form.category,
      note: form.note,
      date: form.date,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ amount: '', category: 'FOOD', note: '', date: new Date().toISOString().slice(0, 10) });
    }, 2000);
  };

  const recentLog = expenses.slice(0, 5);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Log Expense</h1>
        <p className="text-xs text-slate-400 mt-0.5">Add manually or say "Alexa, tell North Star I spent…"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 items-start">
        {/* Form */}
        <form onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-indigo-500" /> New Expense
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Amount (₹)</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 250"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              required
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Category</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Note</label>
            <input
              type="text"
              placeholder="e.g. dinner at Mainland China"
              value={form.note}
              onChange={e => set('note', e.target.value)}
              required
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all
              ${submitted
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'}`}
          >
            {submitted ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            ) : 'Save Expense'}
          </button>

          {/* Voice hint */}
          <div className="flex items-start gap-3 bg-indigo-50 rounded-lg px-4 py-3 mt-1">
            <Mic className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              Or just say: <span className="font-semibold">"Alexa, tell North Star I spent 250 on food"</span>
            </p>
          </div>
        </form>

        {/* Recent entries */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recently Added</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your latest logged expenses</p>
          </div>
          <div className="divide-y divide-slate-50">
            {recentLog.map(e => {
              const meta = categoryMap[e.category];
              return (
                <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ background: meta.color + '22' }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{e.note}</p>
                    <p className="text-[11px] text-slate-400">{e.date} · {meta.label}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 shrink-0">
                    ₹{e.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

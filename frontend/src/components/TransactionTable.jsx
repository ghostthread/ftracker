import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Mic, X } from 'lucide-react';
import { categoryMap, CATEGORIES } from '../data/mockData';
import { useProfile } from '../context/ProfileContext';

const PAGE_SIZE = 8;

export default function ExpenseTable({ globalSearch }) {
  const { expenses } = useProfile();
  const [localSearch, setLocalSearch] = useState('');
  const [page, setPage] = useState(1);
  const [catFilter, setCatFilter] = useState('ALL');

  const search = globalSearch || localSearch;

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchCat = catFilter === 'ALL' || e.category === catFilter;
      const q = search.toLowerCase();
      const meta = categoryMap[e.category];
      const matchSearch = !q ||
        e.note.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        meta.label.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, catFilter, expenses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleCat = (c) => { setCatFilter(c); setPage(1); };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Expense Log</h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Mic className="w-3 h-3" /> Logged via North Star · {filtered.length} entries
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category filter — scrollable on small screens */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-xs sm:max-w-none">
            <button
              onClick={() => handleCat('ALL')}
              className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border transition-all
                ${catFilter === 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              All
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => handleCat(c.id)}
                className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border transition-all
                  ${catFilter === c.id
                    ? 'text-white border-transparent'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                style={catFilter === c.id ? { background: c.color, borderColor: c.color } : {}}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {!globalSearch && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search…"
                value={localSearch}
                onChange={e => { setLocalSearch(e.target.value); setPage(1); }}
                className="pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                  placeholder:text-slate-400 w-32 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {['ID', 'Date', 'Category', 'Note', 'Amount'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                  No expenses match your filters.
                </td>
              </tr>
            ) : paged.map(e => {
              const meta = categoryMap[e.category];
              return (
                <tr key={e.id} className="hover:bg-slate-50/70 transition-colors cursor-default">
                  <td className="px-5 py-3.5 text-xs font-mono font-medium text-slate-400">{e.id}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{e.date}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ background: meta.color }}
                    >
                      {meta.icon} {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600 max-w-xs truncate">{e.note}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-slate-900 whitespace-nowrap">
                    ₹{e.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Showing <span className="font-medium text-slate-700">
            {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
          </span> of <span className="font-medium text-slate-700">{filtered.length}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500
              hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors
                ${p === safePage ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500
              hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

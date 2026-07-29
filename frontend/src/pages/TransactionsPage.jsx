import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, Download, X } from 'lucide-react';
import { categoryMap, CATEGORIES } from '../data/mockData';
import { useProfile } from '../context/ProfileContext';

const PAGE_SIZE = 12;

export default function TransactionsPage({ globalSearch }) {
  const { expenses } = useProfile();
  const [localSearch, setLocalSearch] = useState('');
  const [catFilter, setCatFilter]     = useState('ALL');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [minAmt, setMinAmt]           = useState('');
  const [maxAmt, setMaxAmt]           = useState('');
  const [page, setPage]               = useState(1);

  const search = globalSearch || localSearch;

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (catFilter !== 'ALL' && e.category !== catFilter) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo   && e.date > dateTo)   return false;
      if (minAmt   && e.amount < Number(minAmt)) return false;
      if (maxAmt   && e.amount > Number(maxAmt)) return false;
      const q = search.toLowerCase();
      if (q && !e.note.toLowerCase().includes(q) &&
               !e.id.toLowerCase().includes(q) &&
               !categoryMap[e.category].label.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, catFilter, dateFrom, dateTo, minAmt, maxAmt]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearFilters = () => {
    setCatFilter('ALL'); setDateFrom(''); setDateTo('');
    setMinAmt(''); setMaxAmt(''); setLocalSearch(''); setPage(1);
  };
  const hasFilters = catFilter !== 'ALL' || dateFrom || dateTo || minAmt || maxAmt || localSearch;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Transactions</h1>
          <p className="text-xs text-slate-400 mt-0.5">Full expense history</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            {filtered.length} results · ₹{total.toLocaleString('en-IN')} total
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600
            border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Note, category…"
              value={localSearch}
              onChange={e => { setLocalSearch(e.target.value); setPage(1); }}
              className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-40
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-slate-50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Category</label>
          <select
            value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Date From</label>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Date To</label>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Min ₹</label>
          <input type="number" placeholder="0" value={minAmt} onChange={e => { setMinAmt(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 w-24
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Max ₹</label>
          <input type="number" placeholder="∞" value={maxAmt} onChange={e => { setMaxAmt(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 w-24
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
        </div>

        {hasFilters && (
          <button onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600
              border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors self-end">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
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
                  <td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-400">
                    No expenses match your filters.
                  </td>
                </tr>
              ) : paged.map(e => {
                const meta = categoryMap[e.category];
                return (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-400">{e.id}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{e.date}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ background: meta.color }}>
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

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Showing <span className="font-medium text-slate-700">
              {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
            </span> of <span className="font-medium text-slate-700">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500
                hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors
                  ${p === safePage ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500
                hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

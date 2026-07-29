import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CATEGORIES, categoryMap, DEFAULT_BUDGETS } from '../data/mockData';
import { readGist, writeGist, readAdditionalGist, writeAdditionalGist } from '../utils/gistApi';

const LS_EXPENSES   = 'ftracker_expenses_v1';
const LS_ADDITIONAL = 'ftracker_additional_v1';

const readLS = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

const ProfileContext = createContext(null);

// ── derived helpers ───────────────────────────────────────────────────────────
export const computeCategorySpend = (expenses, month) => {
  const filtered = expenses.filter(e => e.date.startsWith(month));
  const map = {};
  CATEGORIES.forEach(c => { map[c.id] = 0; });
  filtered.forEach(e => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
  return CATEGORIES.map(c => ({ id: c.id, amount: map[c.id] }));
};

export const computeMonthlySpend = (expenses) => {
  const map = {};
  expenses.forEach(e => {
    const m = e.date.slice(0, 7);
    map[m] = (map[m] ?? 0) + e.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month: new Date(month + '-01').toLocaleString('default', { month: 'short' }),
      monthKey: month,
      total,
    }));
};

export const computeDailySpend = (expenses, monthKey) => {
  const year  = parseInt(monthKey.slice(0, 4));
  const month = parseInt(monthKey.slice(5, 7));
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const map = {};
  expenses
    .filter(e => e.date.startsWith(monthKey))
    .forEach(e => { const d = parseInt(e.date.slice(8, 10)); map[d] = (map[d] ?? 0) + e.amount; });
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
    return { day, amount: dateStr > today ? null : (map[day] ?? 0) };
  });
};
// ─────────────────────────────────────────────────────────────────────────────

export function ProfileProvider({ children }) {
  const [loading, setLoading] = useState(true);

  const [expenses,      setExpenses]      = useState(() => readLS(LS_EXPENSES, []).expenses || []);
  const [budgets,       setBudgets]       = useState(() => readLS(LS_ADDITIONAL, {}).budgets || DEFAULT_BUDGETS);
  const [notifications, setNotifications] = useState(() => readLS(LS_ADDITIONAL, {}).notifications || []);

  // Load fresh data from both gists on mount
  useEffect(() => {
    (async () => {
      try {
        const [expData, addData] = await Promise.all([readGist(), readAdditionalGist()]);

        if (expData.expenses?.length > 0) {
          setExpenses(expData.expenses);
          localStorage.setItem(LS_EXPENSES, JSON.stringify({ expenses: expData.expenses, lastUpdated: expData.lastUpdated }));
        }

        if (Object.keys(addData.budgets).length > 0 || addData.notifications?.length > 0) {
          setBudgets(addData.budgets || DEFAULT_BUDGETS);
          setNotifications(addData.notifications || []);
          localStorage.setItem(LS_ADDITIONAL, JSON.stringify(addData));
        }
      } catch (err) {
        console.error('ProfileProvider init error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const categorySpend = useMemo(() => computeCategorySpend(expenses, currentMonthKey), [expenses, currentMonthKey]);
  const monthlySpend  = useMemo(() => computeMonthlySpend(expenses),                  [expenses]);
  const dailySpend    = useMemo(() => computeDailySpend(expenses, currentMonthKey),   [expenses, currentMonthKey]);

  const addExpense = async (exp) => {
    const now = new Date();
    const record = {
      id:        exp.id || `EXP-${Date.now()}`,
      amount:    exp.amount,
      category:  exp.category,
      date:      exp.date,
      note:      exp.note,
      createdAt: now.toISOString(),
      source:    'WEB',
    };
    const next = [record, ...expenses];
    setExpenses(next);

    await writeGist({ expenses: next, lastUpdated: now.toISOString() });
    localStorage.setItem(LS_EXPENSES, JSON.stringify({ expenses: next, lastUpdated: now.toISOString() }));

    const meta = categoryMap[exp.category];
    setNotifications(n => [{
      id:    Date.now(),
      type:  'voice',
      title: 'Expense added',
      body:  `₹${exp.amount.toLocaleString('en-IN')} on ${meta?.label ?? exp.category}`,
      time:  'just now',
      read:  false,
    }, ...n]);
  };

  const updateBudget = async (id, amount) => {
    const next = { ...budgets, [id]: amount };
    setBudgets(next);

    const addData = { budgets: next, notifications };
    await writeAdditionalGist(addData);
    localStorage.setItem(LS_ADDITIONAL, JSON.stringify(addData));
  };

  const clearData = async () => {
    setExpenses([]);
    setBudgets(DEFAULT_BUDGETS);
    setNotifications([]);
    localStorage.removeItem(LS_EXPENSES);
    localStorage.removeItem(LS_ADDITIONAL);

    const now = new Date();
    await Promise.all([
      writeGist({ expenses: [], lastUpdated: now.toISOString() }),
      writeAdditionalGist({ budgets: DEFAULT_BUDGETS, notifications: [] }),
    ]);
  };

  return (
    <ProfileContext.Provider value={{
      loading,
      expenses, budgets, notifications, setNotifications,
      categorySpend, monthlySpend, dailySpend,
      currentMonthKey,
      addExpense, updateBudget, clearData,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
};

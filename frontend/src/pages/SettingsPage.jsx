import { useState } from 'react';
import { Check, Mic, Bell, Shield, Palette, User, Key, Eye, EyeOff } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
      <Icon className="w-4 h-4 text-indigo-500" />
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
    </div>
    <div className="divide-y divide-slate-50">{children}</div>
  </div>
);

const Row = ({ label, sub, children }) => (
  <div className="flex items-center justify-between px-5 py-4 gap-4">
    <div>
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none
      ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
      ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
  </button>
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50
      focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export default function SettingsPage() {
  const [saved, setSaved]         = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [token, setToken]         = useState(() => localStorage.getItem('ftracker_gh_token') || '');

  const saveToken = () => {
    localStorage.setItem('ftracker_gh_token', token.trim());
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
  };

  const [s, setS] = useState({
    name: 'Anupam',
    email: 'anupam@example.com',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    weekStart: 'monday',
    budgetAlerts: true,
    dailySummary: false,
    overspendAlert: true,
    alexaConfirm: true,
    voiceSummary: true,
    darkMode: false,
    compactView: false,
    twoFactor: false,
    sessionTimeout: '30',
  });

  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage your preferences and account</p>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <Row label="Display name" sub="Shown in the dashboard header">
          <input
            type="text"
            value={s.name}
            onChange={e => set('name', e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 w-40
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </Row>
        <Row label="Email" sub="Used for report delivery">
          <input
            type="email"
            value={s.email}
            onChange={e => set('email', e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 w-48
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </Row>
        <Row label="Currency" sub="All amounts displayed in this currency">
          <Select value={s.currency} onChange={v => set('currency', v)} options={[
            { value: 'INR', label: '₹ Indian Rupee (INR)' },
            { value: 'USD', label: '$ US Dollar (USD)' },
            { value: 'EUR', label: '€ Euro (EUR)' },
            { value: 'GBP', label: '£ British Pound (GBP)' },
          ]} />
        </Row>
        <Row label="Timezone">
          <Select value={s.timezone} onChange={v => set('timezone', v)} options={[
            { value: 'Asia/Kolkata',   label: 'Asia/Kolkata (IST)' },
            { value: 'America/New_York', label: 'America/New_York (ET)' },
            { value: 'Europe/London',  label: 'Europe/London (GMT)' },
          ]} />
        </Row>
        <Row label="Week starts on">
          <Select value={s.weekStart} onChange={v => set('weekStart', v)} options={[
            { value: 'monday', label: 'Monday' },
            { value: 'sunday', label: 'Sunday' },
          ]} />
        </Row>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <Row label="Budget alerts" sub="Notify when a category reaches 80% of its budget">
          <Toggle checked={s.budgetAlerts} onChange={v => set('budgetAlerts', v)} />
        </Row>
        <Row label="Daily summary" sub="Receive a daily spend digest each evening">
          <Toggle checked={s.dailySummary} onChange={v => set('dailySummary', v)} />
        </Row>
        <Row label="Overspend alert" sub="Notify immediately when you exceed any budget">
          <Toggle checked={s.overspendAlert} onChange={v => set('overspendAlert', v)} />
        </Row>
      </Section>

      {/* Alexa / Voice */}
      <Section icon={Mic} title="Alexa / Voice">
        <Row label="Confirmation responses" sub={`Alexa says "Got it, I've saved ₹X" after logging`}>
          <Toggle checked={s.alexaConfirm} onChange={v => set('alexaConfirm', v)} />
        </Row>
        <Row label="Voice summary" sub={`"Alexa, ask North Star for my summary" response style`}>
          <Select value={s.voiceSummary ? 'detailed' : 'brief'} onChange={v => set('voiceSummary', v === 'detailed')} options={[
            { value: 'detailed', label: 'Detailed' },
            { value: 'brief',    label: 'Brief' },
          ]} />
        </Row>
      </Section>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance">
        <Row label="Dark mode" sub="Switch to a dark colour scheme">
          <Toggle checked={s.darkMode} onChange={v => set('darkMode', v)} />
        </Row>
        <Row label="Compact view" sub="Denser table rows and reduced card padding">
          <Toggle checked={s.compactView} onChange={v => set('compactView', v)} />
        </Row>
      </Section>

      {/* GitHub Token */}
      <Section icon={Key} title="Data Sync">
        <div className="px-5 py-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-slate-800">GitHub Personal Access Token</p>
            <p className="text-xs text-slate-400 mt-0.5">Required to save expenses and budgets. Stored locally, never sent to any server. Generate one at github.com/settings/tokens with <span className="font-mono bg-slate-100 px-1 rounded">gist</span> scope.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 pr-9
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 font-mono"
              />
              <button onClick={() => setShowToken(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button onClick={saveToken}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0
                ${tokenSaved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'}`}>
              {tokenSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>
          {token && <p className="text-[11px] text-emerald-600 font-medium">✓ Token set — writes enabled</p>}
        </div>
      </Section>

      {/* Security */}
      <Section icon={Shield} title="Security">
        <Row label="Two-factor authentication" sub="Extra login verification via authenticator app">
          <Toggle checked={s.twoFactor} onChange={v => set('twoFactor', v)} />
        </Row>
        <Row label="Session timeout" sub="Automatically sign out after inactivity">
          <Select value={s.sessionTimeout} onChange={v => set('sessionTimeout', v)} options={[
            { value: '15',  label: '15 minutes' },
            { value: '30',  label: '30 minutes' },
            { value: '60',  label: '1 hour' },
            { value: '240', label: '4 hours' },
          ]} />
        </Row>
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all
            ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'}`}
        >
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

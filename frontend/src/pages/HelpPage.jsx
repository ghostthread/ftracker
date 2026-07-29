import { useState } from 'react';
import { Mic, ChevronDown, ChevronRight, ExternalLink, Search, BookOpen, MessageCircle, Zap } from 'lucide-react';

const faqs = [
  {
    q: 'How do I log an expense with Alexa?',
    a: 'Say "Alexa, tell North Star I spent [amount] on [category]." For example: "Alexa, tell North Star I spent 200 on grocery." Alexa will confirm the amount and category, then ask you to confirm before saving.',
  },
  {
    q: 'What categories can I use?',
    a: 'There are 11 categories: Food, Grocery, Fuel, Shopping, Rent, Bills, Travel, Entertainment, Health, Subscription, and Misc. You can use natural phrases — saying "groceries" or "supermarket" will map to the Grocery category.',
  },
  {
    q: 'Can I log multiple expenses at once?',
    a: 'Yes! Say "Alexa, tell North Star I spent 200 on food and 150 on fuel." The skill handles bulk expense logging in a single utterance.',
  },
  {
    q: 'How do I check my spending summary via Alexa?',
    a: 'Say "Alexa, ask North Star for my summary" or "Alexa, ask North Star what I spent this week." You can also ask for a specific category: "Alexa, ask North Star how much I spent on food."',
  },
  {
    q: 'Why is an expense missing from the dashboard?',
    a: 'The dashboard currently runs on mock data while the backend is being built. Once the Lambda → Spring Boot → PostgreSQL pipeline is live, all Alexa-logged expenses will appear in real time.',
  },
  {
    q: 'How do I edit or delete a logged expense?',
    a: 'Use the Expenses page to manage entries manually. Voice-based editing ("Alexa, delete my last expense") is on the roadmap.',
  },
  {
    q: 'How do I set or change my budgets?',
    a: 'Go to the Budgets page. Each category card has a pencil icon — click it, type the new amount, and press Enter to save.',
  },
  {
    q: 'Is my data private?',
    a: 'Your expense data stays within your AWS account (Lambda + the backend you deploy). Nothing is sent to third-party analytics services.',
  },
];

const voiceCommands = [
  { cmd: '"Alexa, tell North Star I spent 200 on grocery"',       desc: 'Log a single expense' },
  { cmd: '"Alexa, tell North Star I spent 500 on food and 300 on fuel"', desc: 'Log multiple at once' },
  { cmd: '"Alexa, ask North Star for my summary"',                desc: 'Hear your monthly total' },
  { cmd: '"Alexa, ask North Star what I spent on food"',          desc: 'Category breakdown' },
  { cmd: '"Alexa, ask North Star what I spent this week"',        desc: 'Weekly summary' },
  { cmd: '"Alexa, tell North Star cancel"',                       desc: 'Cancel a pending save' },
];

const Accordion = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-medium text-slate-800 pr-4">{q}</span>
        {open
          ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</div>
      )}
    </div>
  );
};

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const filtered = faqs.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Help & Docs</h1>
        <p className="text-xs text-slate-400 mt-0.5">Everything you need to use North Star</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Mic,         title: 'Voice Commands',  sub: 'All Alexa phrases',      color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: BookOpen,    title: 'User Guide',      sub: 'Full documentation',     color: 'text-violet-600', bg: 'bg-violet-50' },
          { icon: MessageCircle, title: 'Report a Bug',  sub: 'GitHub Issues',          color: 'text-rose-600',   bg: 'bg-rose-50' },
        ].map(({ icon: Icon, title, sub, color, bg }) => (
          <button key={title}
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3.5
              shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 ml-auto" />
          </button>
        ))}
      </div>

      {/* Voice command cheatsheet */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <Zap className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-900">Voice Command Cheatsheet</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {voiceCommands.map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-indigo-700 bg-indigo-50 rounded-md px-2 py-1 inline-block">{cmd}</p>
              </div>
              <p className="text-xs text-slate-500 shrink-0 hidden sm:block">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search FAQs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 w-40
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>
        </div>
        {filtered.length === 0
          ? <p className="px-5 py-10 text-center text-sm text-slate-400">No results for "{search}"</p>
          : filtered.map(f => <Accordion key={f.q} q={f.q} a={f.a} />)
        }
      </div>
    </div>
  );
}

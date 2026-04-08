import { Link } from 'react-router-dom';

const STAGES = [
  { key: 'total_leads',      label: 'All Leads',  color: 'text-white',      href: '/leads' },
  { key: 'priority_leads',   label: 'Priority',   color: 'text-yellow-400', href: '/leads?status=PRIORITY' },
  { key: 'contacted_leads',  label: 'Contacted',  color: 'text-blue-400',   href: '/leads?status=CONTACTED' },
  { key: 'responded_leads',  label: 'Responded',  color: 'text-cyan-400',   href: '/leads?status=RESPONDED' },
  { key: 'interested_leads', label: 'Interested', color: 'text-purple-400', href: '/leads?status=INTERESTED' },
  { key: 'closed_leads',     label: 'Closed',     color: 'text-green-400',  href: '/leads?status=CLOSED' },
];

export default function FunnelBar({ metrics = {} }) {
  const closedRevenue = (metrics.closed_leads || 0) * 300;

  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 flex items-center">
      {STAGES.map((stage, i) => (
        <div key={stage.key} className="flex items-center flex-1">
          <div className="flex-1 text-center">
            <p className="text-xs text-slate-500 mb-1">{stage.label}</p>
            <Link
              to={stage.href}
              className={`text-xl font-bold hover:opacity-75 transition-opacity ${stage.color}`}
            >
              {metrics[stage.key] ?? 0}
            </Link>
          </div>
          {i < STAGES.length - 1 && (
            <span className="text-slate-600 text-lg">›</span>
          )}
        </div>
      ))}
      <div className="flex-1 text-center border-l border-slate-700/50 ml-2 pl-2">
        <p className="text-xs text-slate-500 mb-1">Revenue</p>
        <p className="text-xl font-bold text-green-400">${closedRevenue.toLocaleString()}</p>
      </div>
    </div>
  );
}
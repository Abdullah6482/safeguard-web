import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useIncidents } from '../../hooks/useIncidents';

const COLORS = { Low:'#10B981', Medium:'#FBBF24', High:'#EF4444', Unrated:'#64748B' };
export default function AnalyticsPage() {
  const { incidents, loading, error } = useIncidents();
  const data = useMemo(() => {
    const months = new Map(), risks = new Map(), types = new Map();
    incidents.forEach(i => { const d=new Date(i.incident_at||i.created_at); const key=d.toLocaleDateString(undefined,{year:'numeric',month:'short'}); months.set(key,(months.get(key)||0)+1); const r=i.overall_risk||'Unrated'; risks.set(r,(risks.get(r)||0)+1); types.set(i.incident_type,(types.get(i.incident_type)||0)+1); });
    return { trend:[...months].map(([month,count])=>({month,count})).reverse(), risks:[...risks].map(([name,value])=>({name,value})), types:[...types].map(([name,count])=>({name,count})) };
  }, [incidents]);
  return <section className="page-shell"><div className="page-heading"><div><p className="eyebrow">PERFORMANCE</p><h1>Safety Analytics</h1><p>Live portfolio trends based on report and investigation data.</p></div></div>{error&&<div className="alert error">{error}</div>}{loading?<div className="page-center"><div className="loader"/></div>:<div className="analytics-grid">
    <ChartCard title="Incident trend"><ResponsiveContainer width="100%" height={280}><AreaChart data={data.trend}><CartesianGrid stroke="#ffffff10"/><XAxis dataKey="month" stroke="#94A3B8"/><YAxis stroke="#94A3B8" allowDecimals={false}/><Tooltip/><Area dataKey="count" stroke="#06B6D4" fill="#06B6D433"/></AreaChart></ResponsiveContainer></ChartCard>
    <ChartCard title="Risk distribution"><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={data.risks} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95}>{data.risks.map(x=><Cell key={x.name} fill={COLORS[x.name]}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></ChartCard>
    <ChartCard title="Incident types" wide><ResponsiveContainer width="100%" height={280}><BarChart data={data.types}><CartesianGrid stroke="#ffffff10"/><XAxis dataKey="name" stroke="#94A3B8"/><YAxis stroke="#94A3B8" allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="#3B82F6" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
  </div>}</section>;
}
function ChartCard({ title, children, wide=false }) { return <article className={`chart-card ${wide?'wide':''}`}><h2>{title}</h2>{children}</article>; }

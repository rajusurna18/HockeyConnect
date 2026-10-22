import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { analyticsService } from '../services';
import type { AnalyticsOverview } from '../types';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getOverview();
      setData(res.data.data);
      setLastUpdated(new Date().toLocaleString('en-IN'));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="loading-spinner w-8 h-8" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="text-slate-400 text-sm">Real-time data from database · Last updated: {lastUpdated}</p>
          </div>
          <button onClick={load} className="btn-outline text-sm">↻ Refresh Data</button>
        </div>

        {/* Skill breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Beginner Students', value: data?.beginnerStudents ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-700/40' },
            { label: 'Intermediate Students', value: data?.intermediateStudents ?? 0, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-700/40' },
            { label: 'Advanced Students', value: data?.advancedStudents ?? 0, color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-700/40' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`card border ${bg}`}>
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-slate-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Skill Distribution Pie */}
          <div className="card">
            <h2 className="section-title">Students by Skill Level</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data?.studentsBySkillLevel ?? []} cx="50%" cy="50%" outerRadius={100}
                  innerRadius={50} dataKey="value" nameKey="name"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {(data?.studentsBySkillLevel ?? []).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Registrations */}
          <div className="card">
            <h2 className="section-title">Monthly Registrations Trend</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.monthlyRegistrations ?? []}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Area type="monotone" dataKey="registrations" stroke="#3b82f6" fill="url(#colorReg)" name="Registrations" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Students by Location */}
          {(data?.studentsByLocation ?? []).length > 0 && (
            <div className="card">
              <h2 className="section-title">Students by Location</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={(data?.studentsByLocation ?? []).slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Students by Institution */}
          {(data?.studentsByInstitution ?? []).length > 0 && (
            <div className="card">
              <h2 className="section-title">Students by Institution (Top 8)</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={(data?.studentsByInstitution ?? []).slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 9 }} width={150} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Opportunities by Type */}
          {(data?.opportunitiesByType ?? []).length > 0 && (
            <div className="card">
              <h2 className="section-title">Opportunities by Type</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.opportunitiesByType ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Platform Summary */}
          <div className="card">
            <h2 className="section-title">Platform Summary</h2>
            <div className="space-y-3">
              {[
                { label: 'Total Students', value: data?.totalStudents ?? 0, pct: 100 },
                { label: 'Active Students', value: data?.activeStudents ?? 0, pct: data?.totalStudents ? (data.activeStudents / data.totalStudents) * 100 : 0 },
                { label: 'Training Registrations', value: data?.totalRegistrations ?? 0, pct: 100 },
                { label: 'Competition Registrations', value: data?.totalCompetitionRegistrations ?? 0, pct: 100 },
              ].map(({ label, value, pct }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 text-sm">{label}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700 text-center text-slate-400 text-xs">
              ⚠️ All data from database — updates in real-time when students register or coaches mark attendance
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

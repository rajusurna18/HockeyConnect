import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { analyticsService } from '../services';
import type { AnalyticsOverview } from '../types';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { UserGroupIcon, UserIcon, AcademicCapIcon, TrophyIcon,
  ChartBarIcon, CalendarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getOverview();
      setAnalytics(res.data.data);
      setLastRefresh(new Date());
    } catch { }
    finally { setLoading(false); }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><div className="loading-spinner w-8 h-8" /></div>
    </DashboardLayout>
  );

  const kpis = analytics ? [
    { label: 'Total Students', value: analytics.totalStudents, icon: UserGroupIcon, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700/50' },
    { label: 'Active Students', value: analytics.activeStudents, icon: ArrowTrendingUpIcon, color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-700/50' },
    { label: 'Coaches', value: analytics.totalCoaches, icon: UserIcon, color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-700/50' },
    { label: 'Training Sessions', value: analytics.totalOpportunities, icon: AcademicCapIcon, color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-700/50' },
    { label: 'Competitions', value: analytics.totalCompetitions, icon: TrophyIcon, color: 'text-red-400', bg: 'bg-red-900/30 border-red-700/50' },
    { label: 'Registrations', value: analytics.totalRegistrations, icon: CalendarIcon, color: 'text-teal-400', bg: 'bg-teal-900/30 border-teal-700/50' },
    { label: 'Comp. Registrations', value: analytics.totalCompetitionRegistrations, icon: TrophyIcon, color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700/50' },
    { label: 'Avg Attendance', value: `${(analytics.averageAttendance || 0).toFixed(0)}%`, icon: ChartBarIcon, color: 'text-cyan-400', bg: 'bg-cyan-900/30 border-cyan-700/50' },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Last refreshed: {lastRefresh.toLocaleTimeString('en-IN')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadAnalytics} className="btn-outline text-sm">↻ Refresh</button>
            <Link to="/admin/analytics" className="btn-primary text-sm">Full Analytics</Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`card border ${bg} transition-all hover:scale-105`}>
              <Icon className={`w-6 h-6 ${color} mb-2`} />
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-slate-400 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {analytics && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Skill Distribution */}
            <div className="card">
              <h2 className="section-title">Students by Skill Level</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={analytics.studentsBySkillLevel} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                    {analytics.studentsBySkillLevel.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-2">
                {analytics.studentsBySkillLevel.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-slate-400 text-xs">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Registrations */}
            <div className="card">
              <h2 className="section-title">Monthly Registrations</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.monthlyRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Registrations" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Institutions */}
            {analytics.studentsByInstitution?.length > 0 && (
              <div className="card">
                <h2 className="section-title">Students by Institution (Top 6)</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.studentsByInstitution.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Opportunities by Type */}
            {analytics.opportunitiesByType?.length > 0 && (
              <div className="card">
                <h2 className="section-title">Opportunities by Type</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={analytics.opportunitiesByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {analytics.opportunitiesByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Quick Management Links */}
        <div className="card">
          <h2 className="section-title">Quick Management</h2>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { to: '/admin/students', label: 'Students', count: analytics?.totalStudents },
              { to: '/admin/coaches', label: 'Coaches', count: analytics?.totalCoaches },
              { to: '/admin/opportunities', label: 'Opportunities', count: analytics?.totalOpportunities },
              { to: '/admin/competitions', label: 'Competitions', count: analytics?.totalCompetitions },
              { to: '/admin/analytics', label: 'Full Analytics', count: null },
              { to: '/admin/excel', label: 'Data Management', count: null },
            ].map(({ to, label, count }) => (
              <Link key={to} to={to} className="card-hover p-4 text-center">
                <div className="text-white font-semibold text-sm">{label}</div>
                {count !== null && count !== undefined && <div className="text-blue-400 font-bold text-xl mt-1">{count}</div>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

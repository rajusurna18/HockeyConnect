import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentService, performanceService, attendanceService } from '../services';
import type { Performance, Student } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function StudentPerformancePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [attendancePct, setAttendancePct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const sRes = await studentService.getMyProfile();
      const s = sRes.data.data;
      setStudent(s);
      const [perfRes, attRes, avgRes] = await Promise.allSettled([
        performanceService.getStudentPerformance(s.id),
        attendanceService.getStudentPercentage(s.id),
        performanceService.getAverageScore(s.id),
      ]);
      if (perfRes.status === 'fulfilled') setPerformances(perfRes.value.data.data);
      if (attRes.status === 'fulfilled') setAttendancePct(attRes.value.data.data || 0);
      if (avgRes.status === 'fulfilled') setAvgScore(avgRes.value.data.data || 0);
    } finally { setLoading(false); }
  };

  const chartData = performances.map(p => ({
    date: p.evaluationDate || 'N/A',
    overall: p.overallScore ?? 0,
    fitness: p.fitnessScore ?? 0,
    skill: p.skillScore ?? 0,
    match: p.matchPerformance ?? 0,
  }));

  const latest = performances[performances.length - 1];
  const radarData = latest ? [
    { subject: 'Fitness', A: latest.fitnessScore ?? 0, fullMark: 10 },
    { subject: 'Skill', A: latest.skillScore ?? 0, fullMark: 10 },
    { subject: 'Match', A: latest.matchPerformance ?? 0, fullMark: 10 },
    { subject: 'Attendance', A: attendancePct / 10, fullMark: 10 },
  ] : [];

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><div className="loading-spinner w-8 h-8" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">My Performance</h1>
          <p className="page-subtitle">Track your fitness, skill, and match performance over time</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Avg Overall Score', value: `${avgScore.toFixed(1)}/10`, color: 'text-blue-400' },
            { label: 'Attendance Rate', value: `${attendancePct.toFixed(0)}%`, color: 'text-emerald-400' },
            { label: 'Evaluations', value: performances.length, color: 'text-amber-400' },
            { label: 'Latest Score', value: latest ? `${latest.overallScore?.toFixed(1)}/10` : 'N/A', color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div className="text-slate-400 text-xs uppercase tracking-wide">{label}</div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {performances.length === 0 ? (
          <div className="card text-center py-16">
            <ChartBarIcon className="w-16 h-16 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-lg">No performance records yet</p>
            <p className="text-slate-500 text-sm mt-1">Your coach will add performance evaluations after training sessions</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Progress Over Time */}
            <div className="card">
              <h2 className="section-title">Performance Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={2} name="Overall" />
                  <Line type="monotone" dataKey="fitness" stroke="#10b981" strokeWidth={1.5} name="Fitness" />
                  <Line type="monotone" dataKey="skill" stroke="#8b5cf6" strokeWidth={1.5} name="Skill" />
                  <Line type="monotone" dataKey="match" stroke="#f59e0b" strokeWidth={1.5} name="Match" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            {radarData.length > 0 && (
              <div className="card">
                <h2 className="section-title">Latest Evaluation Radar</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 10]} stroke="#334155" tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Evaluation History */}
            <div className="card lg:col-span-2">
              <h2 className="section-title">Evaluation History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="table-header">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Fitness</th>
                    <th className="px-4 py-3 text-left">Skill</th>
                    <th className="px-4 py-3 text-left">Match</th>
                    <th className="px-4 py-3 text-left">Overall</th>
                    <th className="px-4 py-3 text-left">Coach</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr></thead>
                  <tbody>
                    {[...performances].reverse().map(p => (
                      <tr key={p.id} className="table-row">
                        <td className="table-cell">{p.evaluationDate ? new Date(p.evaluationDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="table-cell"><ScoreBadge score={p.fitnessScore} /></td>
                        <td className="table-cell"><ScoreBadge score={p.skillScore} /></td>
                        <td className="table-cell"><ScoreBadge score={p.matchPerformance} /></td>
                        <td className="table-cell"><ScoreBadge score={p.overallScore} bold /></td>
                        <td className="table-cell">{p.coach?.fullName || '—'}</td>
                        <td className="table-cell text-slate-400 text-xs">{p.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ScoreBadge({ score, bold }: { score?: number; bold?: boolean }) {
  if (score === undefined || score === null) return <span className="text-slate-500">—</span>;
  const color = score >= 8 ? 'text-emerald-400' : score >= 6 ? 'text-blue-400' : score >= 4 ? 'text-amber-400' : 'text-red-400';
  return <span className={`${color} ${bold ? 'font-bold' : ''}`}>{score.toFixed(1)}</span>;
}

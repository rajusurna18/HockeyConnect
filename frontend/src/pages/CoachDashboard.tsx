import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { coachService, opportunityService, registrationService, analyticsService } from '../services';
import type { Coach, Opportunity, TrainingRegistration } from '../types';
import { UserGroupIcon, AcademicCapIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function CoachDashboard() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recentRegs, setRecentRegs] = useState<TrainingRegistration[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const coachRes = await coachService.getMyProfile();
      setCoach(coachRes.data.data);
    } catch { setProfileMissing(true); }

    const [oppRes, analyticsRes] = await Promise.allSettled([
      opportunityService.getAll(),
      analyticsService.getOverview(),
    ]);
    if (oppRes.status === 'fulfilled') {
      const opps = oppRes.value.data.data;
      setOpportunities(opps.slice(0, 5));
      // Load registrations for first opportunity as sample
      if (opps.length > 0) {
        const regRes = await registrationService.getOpportunityRegistrations(opps[0].id).catch(() => null);
        if (regRes) setRecentRegs(regRes.data.data.slice(0, 5));
      }
    }
    if (analyticsRes.status === 'fulfilled') {
      setTotalStudents(analyticsRes.value.data.data.totalStudents);
    }
    setLoading(false);
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><div className="loading-spinner w-8 h-8" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/30 border border-emerald-700/50 rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome, Coach {coach?.fullName?.split(' ')[0] || 'Coach'}! 🏑
              </h1>
              <p className="text-emerald-300 mt-1">{coach?.institution || 'HockeyConnect Coach'}</p>
              {coach?.specialization && <p className="text-slate-400 text-sm mt-1">Specialization: {coach.specialization}</p>}
            </div>
            <Link to="/coach/profile" className="btn-outline text-sm">Edit Profile</Link>
          </div>
        </div>

        {profileMissing && (
          <div className="alert-info flex items-center justify-between">
            <span>Complete your coach profile to help students find you</span>
            <Link to="/coach/profile" className="btn-primary text-sm">Complete Profile</Link>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <UserGroupIcon className="w-5 h-5" /><span className="text-xs uppercase tracking-wide">Total Students</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalStudents}</div>
            <div className="text-slate-400 text-sm">On platform</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <AcademicCapIcon className="w-5 h-5" /><span className="text-xs uppercase tracking-wide">Opportunities</span>
            </div>
            <div className="text-3xl font-bold text-white">{opportunities.length}</div>
            <div className="text-slate-400 text-sm">Active sessions</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <CalendarIcon className="w-5 h-5" /><span className="text-xs uppercase tracking-wide">Registrations</span>
            </div>
            <div className="text-3xl font-bold text-white">{recentRegs.length}</div>
            <div className="text-slate-400 text-sm">Latest session</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <ChartBarIcon className="w-5 h-5" /><span className="text-xs uppercase tracking-wide">Exp. Years</span>
            </div>
            <div className="text-3xl font-bold text-white">{coach?.experienceYears || 0}</div>
            <div className="text-slate-400 text-sm">Experience</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="section-title">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { to: '/coach/training', label: 'Add Training Session', icon: AcademicCapIcon, color: 'bg-blue-600' },
              { to: '/coach/attendance', label: 'Mark Attendance', icon: CalendarIcon, color: 'bg-emerald-600' },
              { to: '/coach/performance', label: 'Update Performance', icon: ChartBarIcon, color: 'bg-purple-600' },
              { to: '/coach/students', label: 'View Students', icon: UserGroupIcon, color: 'bg-amber-600' },
            ].map(({ to, label, icon: Icon, color }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all group">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Recent Student Registrations</h2>
            <Link to="/coach/training" className="text-blue-400 text-sm hover:text-blue-300">Manage →</Link>
          </div>
          {recentRegs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No registrations yet. Create a training session to get started.</div>
          ) : (
            <div className="space-y-2">
              {recentRegs.map(reg => (
                <div key={reg.id} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                  <div>
                    <div className="text-white text-sm font-medium">{reg.student?.fullName}</div>
                    <div className="text-slate-400 text-xs">{reg.student?.institution}</div>
                  </div>
                  <div className="text-right">
                    <div className="badge-green text-xs">{reg.status}</div>
                    <div className="text-slate-500 text-xs mt-1">{new Date(reg.registeredAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

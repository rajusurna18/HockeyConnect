import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentService, registrationService, attendanceService, performanceService, opportunityService } from '../services';
import type { Student, TrainingRegistration, CompetitionRegistration, Opportunity } from '../types';
import {
  UserIcon, TrophyIcon, AcademicCapIcon, ChartBarIcon,
  CalendarIcon, StarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [trainings, setTrainings] = useState<TrainingRegistration[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionRegistration[]>([]);
  const [attendancePct, setAttendancePct] = useState<number>(0);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileRes = await studentService.getMyProfile();
      const s = profileRes.data.data;
      setStudent(s);

      const [trainRes, compRes, recRes] = await Promise.allSettled([
        registrationService.getMyTrainings(),
        registrationService.getMyCompetitions(),
        studentService.getRecommendations(),
      ]);

      if (trainRes.status === 'fulfilled') setTrainings(trainRes.value.data.data);
      if (compRes.status === 'fulfilled') setCompetitions(compRes.value.data.data);
      if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data.data.slice(0, 4));

      const attRes = await attendanceService.getStudentPercentage(s.id);
      setAttendancePct(attRes.data.data || 0);

      const perfRes = await performanceService.getStudentPerformance(s.id);
      const perfData = perfRes.data.data.map((p: any) => ({
        date: p.evaluationDate || 'N/A',
        score: p.overallScore || 0,
        fitness: p.fitnessScore || 0,
        skill: p.skillScore || 0,
      }));
      setPerformanceHistory(perfData);
    } catch (err: any) {
      if (err.response?.status === 404) setProfileMissing(true);
    } finally {
      setLoading(false);
    }
  };

  const skillColor = (level?: string) =>
    level === 'ADVANCED' ? 'badge-purple' :
    level === 'INTERMEDIATE' ? 'badge-blue' : 'badge-green';

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8" />
      </div>
    </DashboardLayout>
  );

  if (profileMissing) return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
        <p className="text-slate-400 mb-6">Set up your student profile to start discovering hockey opportunities in Hyderabad!</p>
        <Link to="/student/profile" className="btn-primary">Set Up Profile →</Link>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {student?.fullName?.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-300 mt-1">
                {student?.institution} · {student?.location}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={skillColor(student?.skillLevel) + ' badge'}>
                  {student?.skillLevel}
                </span>
                <span className="text-slate-400 text-sm">{student?.experienceYears || 0} years experience</span>
              </div>
            </div>
            <Link to="/student/profile" className="btn-outline text-sm">Edit Profile</Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <AcademicCapIcon className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-wide">Trainings</span>
            </div>
            <div className="text-3xl font-bold text-white">{trainings.length}</div>
            <div className="text-slate-400 text-sm">Registered</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <TrophyIcon className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-wide">Competitions</span>
            </div>
            <div className="text-3xl font-bold text-white">{competitions.length}</div>
            <div className="text-slate-400 text-sm">Registered</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <CalendarIcon className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-wide">Attendance</span>
            </div>
            <div className="text-3xl font-bold text-white">{attendancePct.toFixed(0)}%</div>
            <div className="text-slate-400 text-sm">Overall rate</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <ChartBarIcon className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-wide">Status</span>
            </div>
            <div className="text-lg font-bold text-white">{student?.participationStatus}</div>
            <div className="text-slate-400 text-sm">Participation</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <div className="card">
            <h2 className="section-title">Performance Progress</h2>
            {performanceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Overall" />
                  <Line type="monotone" dataKey="fitness" stroke="#10b981" strokeWidth={1.5} dot={false} name="Fitness" />
                  <Line type="monotone" dataKey="skill" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Skill" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                No performance records yet. Ask your coach to record your progress!
              </div>
            )}
          </div>

          {/* My Trainings */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">My Trainings</h2>
              <Link to="/student/registrations" className="text-blue-400 text-sm hover:text-blue-300">View all</Link>
            </div>
            {trainings.length > 0 ? (
              <div className="space-y-3">
                {trainings.slice(0, 4).map(reg => (
                  <div key={reg.id} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AcademicCapIcon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-sm font-medium truncate">
                        {reg.opportunity?.title}
                      </div>
                      <div className="text-slate-400 text-xs">{reg.opportunity?.location}</div>
                    </div>
                    <span className="badge-green text-xs">Confirmed</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-sm text-center py-8">
                No trainings yet.{' '}
                <Link to="/opportunities" className="text-blue-400 hover:underline">Browse opportunities</Link>
              </div>
            )}
          </div>
        </div>

        {/* Smart Recommendations */}
        {recommendations.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <StarIcon className="w-5 h-5 text-amber-400" />
              <h2 className="section-title mb-0">Smart Opportunity Recommendations</h2>
              <span className="badge-yellow text-xs ml-1">AI-powered</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">Based on your location, skill level, and preferred schedule:</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map(opp => (
                <div key={opp.id} className="card-hover p-4">
                  <div className="badge-blue mb-2">{opp.type?.replace('_', ' ')}</div>
                  <div className="text-white font-medium text-sm mt-2 line-clamp-2">{opp.title}</div>
                  <div className="text-slate-400 text-xs mt-1">{opp.location}</div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-slate-400 text-xs">{opp.availableSeats} seats left</span>
                    <Link to={`/opportunities/${opp.id}`} className="text-blue-400 text-xs hover:text-blue-300">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

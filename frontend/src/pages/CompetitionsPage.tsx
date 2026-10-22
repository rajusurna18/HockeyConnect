import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { competitionService, registrationService } from '../services';
import type { Competition } from '../types';
import toast from 'react-hot-toast';
import { MapPinIcon, CalendarIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: 'badge-blue', ONGOING: 'badge-green', COMPLETED: 'badge-yellow', CANCELLED: 'badge-red',
};
const SKILL_COLORS: Record<string, string> = {
  BEGINNER: 'badge-green', INTERMEDIATE: 'badge-blue', ADVANCED: 'badge-purple', ALL: 'badge-yellow',
};

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const [registered, setRegistered] = useState<Set<number>>(new Set());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [compRes, myCompRes] = await Promise.allSettled([
        competitionService.getAll(),
        registrationService.getMyCompetitions(),
      ]);
      if (compRes.status === 'fulfilled') setCompetitions(compRes.value.data.data);
      if (myCompRes.status === 'fulfilled') {
        const ids = new Set(myCompRes.value.data.data.map((r: any) => r.competition?.id as number));
        setRegistered(ids);
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (compId: number) => {
    setRegistering(compId);
    try {
      await registrationService.registerForCompetition(compId);
      toast.success('🏆 Registered for competition!');
      setRegistered(prev => new Set([...prev, compId]));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setRegistering(null); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Hockey Competitions</h1>
          <p className="page-subtitle">Compete, grow, and get noticed</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="loading-spinner w-8 h-8" /></div>
        ) : competitions.length === 0 ? (
          <div className="card text-center py-16">
            <TrophyIcon className="w-16 h-16 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No competitions available right now</p>
            <p className="text-slate-500 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {competitions.map(comp => {
              const isRegistered = registered.has(comp.id);
              return (
                <div key={comp.id} className="card-hover flex flex-col">
                  <div className="flex gap-2 mb-3">
                    <span className={`badge ${STATUS_COLORS[comp.status || 'UPCOMING']}`}>{comp.status || 'UPCOMING'}</span>
                    <span className={`badge ${SKILL_COLORS[comp.skillLevel || 'ALL']}`}>{comp.skillLevel || 'ALL'}</span>
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrophyIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base line-clamp-2">{comp.title}</h3>
                      {comp.organizer && <p className="text-slate-400 text-xs mt-0.5">{comp.organizer}</p>}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{comp.description}</p>
                  <div className="space-y-1.5 mb-4">
                    {comp.location && <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <MapPinIcon className="w-3.5 h-3.5" />{comp.location}
                    </div>}
                    {comp.startDate && <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {new Date(comp.startDate).toLocaleDateString('en-IN')}
                      {comp.endDate && ` – ${new Date(comp.endDate).toLocaleDateString('en-IN')}`}
                    </div>}
                    {comp.maxParticipants && <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <UserGroupIcon className="w-3.5 h-3.5" />{comp.maxParticipants} max participants
                    </div>}
                  </div>
                  {comp.prize && <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-2 mb-4 text-amber-300 text-xs">🏆 Prize: {comp.prize}</div>}
                  <div className="mt-auto pt-3 border-t border-slate-700">
                    {isRegistered ? (
                      <div className="badge-green py-2 px-4 text-sm text-center w-full">✓ Registered</div>
                    ) : (
                      <button onClick={() => handleRegister(comp.id)} disabled={registering === comp.id}
                        className="btn-primary w-full">
                        {registering === comp.id ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner" />Registering...</span> : 'Register Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

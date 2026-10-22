import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { registrationService } from '../services';
import type { TrainingRegistration, CompetitionRegistration } from '../types';
import { AcademicCapIcon, TrophyIcon } from '@heroicons/react/24/outline';

export default function MyRegistrationsPage() {
  const [trainings, setTrainings] = useState<TrainingRegistration[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'training' | 'competition'>('training');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [t, c] = await Promise.allSettled([
      registrationService.getMyTrainings(),
      registrationService.getMyCompetitions(),
    ]);
    if (t.status === 'fulfilled') setTrainings(t.value.data.data);
    if (c.status === 'fulfilled') setCompetitions(c.value.data.data);
    setLoading(false);
  };

  const statusBadge = (s: string) =>
    s === 'CONFIRMED' ? 'badge-green' : s === 'CANCELLED' ? 'badge-red' : 'badge-yellow';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">My Registrations</h1>
          <p className="page-subtitle">All your training and competition registrations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab('training')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === 'training' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            <AcademicCapIcon className="w-4 h-4" />Training ({trainings.length})
          </button>
          <button onClick={() => setTab('competition')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === 'competition' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            <TrophyIcon className="w-4 h-4" />Competitions ({competitions.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="loading-spinner w-8 h-8" /></div>
        ) : tab === 'training' ? (
          trainings.length === 0 ? (
            <div className="card text-center py-16">
              <AcademicCapIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No training registrations yet</p>
              <a href="/opportunities" className="btn-primary mt-4 inline-block">Browse Opportunities</a>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Training</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Registered</th>
                </tr></thead>
                <tbody>
                  {trainings.map(reg => (
                    <tr key={reg.id} className="table-row">
                      <td className="table-cell font-medium text-white">{reg.opportunity?.title}</td>
                      <td className="table-cell">{reg.opportunity?.location || '—'}</td>
                      <td className="table-cell">{reg.opportunity?.date ? new Date(reg.opportunity.date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="table-cell"><span className="badge-blue">{reg.opportunity?.type?.replace('_',' ')}</span></td>
                      <td className="table-cell"><span className={`badge ${statusBadge(reg.status)}`}>{reg.status}</span></td>
                      <td className="table-cell text-slate-400 text-xs">{new Date(reg.registeredAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          competitions.length === 0 ? (
            <div className="card text-center py-16">
              <TrophyIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No competition registrations yet</p>
              <a href="/competitions" className="btn-primary mt-4 inline-block">Browse Competitions</a>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Competition</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Start Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Result</th>
                </tr></thead>
                <tbody>
                  {competitions.map(reg => (
                    <tr key={reg.id} className="table-row">
                      <td className="table-cell font-medium text-white">{reg.competition?.title}</td>
                      <td className="table-cell">{reg.competition?.location || '—'}</td>
                      <td className="table-cell">{reg.competition?.startDate ? new Date(reg.competition.startDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="table-cell"><span className={`badge ${statusBadge(reg.status)}`}>{reg.status}</span></td>
                      <td className="table-cell">{reg.result || <span className="text-slate-500">Pending</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}

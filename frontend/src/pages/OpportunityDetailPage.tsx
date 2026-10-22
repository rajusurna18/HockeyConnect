import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { opportunityService, registrationService } from '../services';
import type { Opportunity } from '../types';
import toast from 'react-hot-toast';
import { MapPinIcon, CalendarIcon, ClockIcon, UserGroupIcon, PhoneIcon } from '@heroicons/react/24/outline';

const TYPE_COLORS: Record<string, string> = {
  TRAINING: 'badge-blue', ACADEMY: 'badge-green', SCHOOL_TEAM: 'badge-yellow',
  COLLEGE_TEAM: 'badge-purple', COMPETITION: 'badge-red', TOURNAMENT: 'badge-red',
};
const SKILL_COLORS: Record<string, string> = {
  BEGINNER: 'badge-green', INTERMEDIATE: 'badge-blue', ADVANCED: 'badge-purple', ALL: 'badge-yellow',
};

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (id) loadOpportunity(Number(id));
  }, [id]);

  const loadOpportunity = async (oppId: number) => {
    try {
      const res = await opportunityService.getById(oppId);
      setOpportunity(res.data.data);
    } catch {
      toast.error('Opportunity not found');
      navigate('/opportunities');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!opportunity) return;
    setRegistering(true);
    try {
      await registrationService.registerForTraining(opportunity.id);
      toast.success('🎉 Successfully registered! Check your dashboard.');
      setRegistered(true);
      setOpportunity(prev => prev ? { ...prev, availableSeats: (prev.availableSeats ?? 1) - 1 } : null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally { setRegistering(false); }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><div className="loading-spinner w-8 h-8" /></div>
    </DashboardLayout>
  );

  if (!opportunity) return null;

  const isFull = (opportunity.availableSeats ?? 0) <= 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="text-blue-400 text-sm hover:text-blue-300">← Back to Opportunities</button>

        <div className="card">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`badge ${TYPE_COLORS[opportunity.type] || 'badge-blue'}`}>
              {opportunity.type?.replace('_', ' ')}
            </span>
            <span className={`badge ${SKILL_COLORS[opportunity.skillLevel || 'ALL']}`}>
              {opportunity.skillLevel || 'ALL LEVELS'}
            </span>
            <span className={`badge ${isFull ? 'badge-red' : 'badge-green'}`}>
              {isFull ? 'Full' : `${opportunity.availableSeats} seats available`}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">{opportunity.title}</h1>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {opportunity.organizer && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-blue-400" />
                <div><div className="text-slate-400 text-xs">Organizer</div><div className="text-white text-sm">{opportunity.organizer}</div></div>
              </div>
            )}
            {opportunity.location && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-emerald-400" />
                <div><div className="text-slate-400 text-xs">Location</div><div className="text-white text-sm">{opportunity.location}</div></div>
              </div>
            )}
            {opportunity.date && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-amber-400" />
                <div><div className="text-slate-400 text-xs">Date</div>
                  <div className="text-white text-sm">{new Date(opportunity.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            )}
            {(opportunity.startTime || opportunity.endTime) && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <ClockIcon className="w-5 h-5 text-purple-400" />
                <div><div className="text-slate-400 text-xs">Time</div>
                  <div className="text-white text-sm">
                    {opportunity.startTime?.substring(0,5)}{opportunity.endTime ? ` – ${opportunity.endTime.substring(0,5)}` : ''}
                  </div>
                </div>
              </div>
            )}
            {opportunity.contactInfo && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg sm:col-span-2">
                <PhoneIcon className="w-5 h-5 text-teal-400" />
                <div><div className="text-slate-400 text-xs">Contact</div><div className="text-white text-sm">{opportunity.contactInfo}</div></div>
              </div>
            )}
          </div>

          {opportunity.description && (
            <div className="mb-6">
              <h2 className="text-white font-semibold mb-2">About This Opportunity</h2>
              <p className="text-slate-300 leading-relaxed">{opportunity.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div>
              <div className="text-white font-semibold">
                {opportunity.totalSeats ? `${opportunity.availableSeats} / ${opportunity.totalSeats} seats available` : 'Seats available'}
              </div>
              {opportunity.coach && (
                <div className="text-slate-400 text-sm mt-1">Coach: {opportunity.coach.fullName}</div>
              )}
            </div>
            {registered ? (
              <div className="badge-green py-2 px-4 text-sm">✓ Registered</div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isFull || registering}
                className={isFull ? 'btn-danger cursor-not-allowed opacity-60' : 'btn-primary'}
              >
                {registering ? <span className="flex items-center gap-2"><div className="loading-spinner" />Registering...</span>
                  : isFull ? 'Session Full' : 'Register Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

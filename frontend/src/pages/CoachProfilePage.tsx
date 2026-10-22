import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { coachService } from '../services';
import type { Coach } from '../types';
import toast from 'react-hot-toast';

export default function CoachProfilePage() {
  const [coach, setCoach] = useState<Partial<Coach>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    coachService.getMyProfile()
      .then(res => setCoach(res.data.data))
      .catch(() => {/* new coach */})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coach.fullName?.trim()) { toast.error('Full name is required'); return; }
    setSaving(true);
    try {
      await coachService.createOrUpdateProfile(coach);
      toast.success('Coach profile saved!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="loading-spinner w-8 h-8" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div><h1 className="page-title">Coach Profile</h1><p className="page-subtitle">Help students find you with a complete profile</p></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="section-title">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-2">
                <label className="label">Full Name *</label>
                <input className="input-field" value={coach.fullName || ''} required onChange={e => setCoach(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Phone</label>
                <input className="input-field" value={coach.phone || ''} onChange={e => setCoach(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Location</label>
                <input className="input-field" placeholder="City" value={coach.location || ''} onChange={e => setCoach(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="card space-y-4">
            <h2 className="section-title">Professional Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-2">
                <label className="label">Institution / Club</label>
                <input className="input-field" placeholder="e.g. SAI Academy, Hyderabad" value={coach.institution || ''} onChange={e => setCoach(p => ({ ...p, institution: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Specialization</label>
                <input className="input-field" placeholder="e.g. Attack, Defense" value={coach.specialization || ''} onChange={e => setCoach(p => ({ ...p, specialization: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Years of Experience</label>
                <input type="number" min={0} max={40} className="input-field" value={coach.experienceYears || 0} onChange={e => setCoach(p => ({ ...p, experienceYears: Number(e.target.value) }))} />
              </div>
              <div className="form-group sm:col-span-2">
                <label className="label">Certifications</label>
                <input className="input-field" placeholder="e.g. NIS Level 1, SAI Certified" value={coach.certifications || ''} onChange={e => setCoach(p => ({ ...p, certifications: e.target.value }))} />
              </div>
              <div className="form-group sm:col-span-2">
                <label className="label">Bio</label>
                <textarea rows={3} className="input-field" placeholder="Brief description of your hockey background..." value={coach.bio || ''} onChange={e => setCoach(p => ({ ...p, bio: e.target.value }))} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner" />Saving...</span> : 'Save Profile'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

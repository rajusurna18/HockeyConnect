import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentService } from '../services';
import type { Student } from '../types';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['Morning', 'Afternoon', 'Evening'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function StudentProfile() {
  const [student, setStudent] = useState<Partial<Student>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await studentService.getMyProfile();
      const s = res.data.data;
      setStudent(s);
      setSelectedDays(s.preferredDays ? s.preferredDays.split(',').map(d => d.trim()) : []);
    } catch { /* new user */ }
    finally { setLoading(false); }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.fullName?.trim()) { toast.error('Full name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...student, preferredDays: selectedDays.join(',') };
      await studentService.createOrUpdateProfile(payload);
      toast.success('Profile saved successfully!');
      loadProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><div className="loading-spinner w-8 h-8" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="page-title">Student Profile</h1>
          <p className="page-subtitle">Keep your profile updated to get the best opportunity recommendations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="card space-y-4">
            <h2 className="section-title">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input className="input-field" value={student.fullName || ''} required
                  onChange={e => setStudent(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Age</label>
                <input type="number" min={5} max={40} className="input-field" value={student.age || ''}
                  onChange={e => setStudent(p => ({ ...p, age: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="label">Gender</label>
                <select className="select-field" value={student.gender || ''}
                  onChange={e => setStudent(p => ({ ...p, gender: e.target.value }))}>
                  <option value="">Select gender</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Phone</label>
                <input className="input-field" value={student.phone || ''}
                  onChange={e => setStudent(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="card space-y-4">
            <h2 className="section-title">Academic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-2">
                <label className="label">School / College Name</label>
                <input className="input-field" placeholder="e.g. Osmania University, Hyderabad"
                  value={student.institution || ''}
                  onChange={e => setStudent(p => ({ ...p, institution: e.target.value }))} />
              </div>
              <div className="form-group sm:col-span-2">
                <label className="label">Location</label>
                <input className="input-field" placeholder="e.g. Hyderabad, Secunderabad"
                  value={student.location || ''}
                  onChange={e => setStudent(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Hockey Info */}
          <div className="card space-y-4">
            <h2 className="section-title">Hockey Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Skill Level</label>
                <select className="select-field" value={student.skillLevel || 'BEGINNER'}
                  onChange={e => setStudent(p => ({ ...p, skillLevel: e.target.value as any }))}>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Years of Experience</label>
                <input type="number" min={0} max={20} className="input-field" value={student.experienceYears || 0}
                  onChange={e => setStudent(p => ({ ...p, experienceYears: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Preferred Training Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button key={day} type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                      ${selectedDays.includes(day)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500'}`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Preferred Training Time</label>
              <div className="flex gap-3">
                {TIMES.map(time => (
                  <button key={time} type="button"
                    onClick={() => setStudent(p => ({ ...p, preferredTime: time }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border
                      ${student.preferredTime === time
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500'}`}>
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner" /> Saving...</span> : 'Save Profile'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

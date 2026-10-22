import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { opportunityService, registrationService, attendanceService, coachService } from '../services';
import type { Opportunity, TrainingRegistration, Coach } from '../types';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coach, setCoach] = useState<Coach | null>(null);

  useEffect(() => {
    opportunityService.getAll().then(r => setOpportunities(r.data.data));
    coachService.getMyProfile().then(r => setCoach(r.data.data)).catch(() => {});
  }, []);

  const loadStudents = async () => {
    if (!selectedOpp) return;
    setLoading(true);
    try {
      const res = await registrationService.getOpportunityRegistrations(selectedOpp);
      const regs = res.data.data;
      setRegistrations(regs);
      // Default all to PRESENT
      const defaults: Record<number, string> = {};
      regs.forEach(r => { if (r.student?.id) defaults[r.student.id] = 'PRESENT'; });
      setAttendance(defaults);
    } catch { toast.error('Could not load students'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!selectedOpp || registrations.length === 0) { toast.error('Select a session and load students first'); return; }
    setSaving(true);
    let saved = 0, failed = 0;
    for (const reg of registrations) {
      if (!reg.student?.id) continue;
      try {
        await attendanceService.mark({
          studentId: reg.student.id,
          opportunityId: selectedOpp,
          date,
          status: attendance[reg.student.id] || 'PRESENT',
          remarks: remarks[reg.student.id] || '',
          coachId: coach?.id,
        });
        saved++;
      } catch { failed++; }
    }
    setSaving(false);
    toast.success(`Attendance saved: ${saved} records${failed > 0 ? `, ${failed} failed` : ''}`);
  };

  const statusClass = (s: string) =>
    s === 'PRESENT' ? 'bg-emerald-600' : s === 'ABSENT' ? 'bg-red-600' : 'bg-amber-600';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="page-title">Mark Attendance</h1><p className="page-subtitle">Select a training session and mark student attendance</p></div>

        {/* Session Selection */}
        <div className="card">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="form-group sm:col-span-2">
              <label className="label">Training Session</label>
              <select className="select-field" value={selectedOpp || ''} onChange={e => setSelectedOpp(Number(e.target.value))}>
                <option value="">-- Select Training Session --</option>
                {opportunities.map(o => <option key={o.id} value={o.id}>{o.title} — {o.location}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Date</label>
              <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <button onClick={loadStudents} disabled={!selectedOpp} className="btn-primary mt-4">
            Load Students
          </button>
        </div>

        {/* Attendance Table */}
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="loading-spinner w-8 h-8" /></div>
        ) : registrations.length > 0 ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">{registrations.length} Registered Students</h2>
              <div className="flex gap-2">
                <button onClick={() => { const a: Record<number,string> = {}; registrations.forEach(r => r.student?.id && (a[r.student.id] = 'PRESENT')); setAttendance(a); }}
                  className="text-xs px-3 py-1 rounded bg-emerald-800 text-emerald-300 hover:bg-emerald-700">Mark All Present</button>
                <button onClick={() => { const a: Record<number,string> = {}; registrations.forEach(r => r.student?.id && (a[r.student.id] = 'ABSENT')); setAttendance(a); }}
                  className="text-xs px-3 py-1 rounded bg-red-900 text-red-300 hover:bg-red-800">Mark All Absent</button>
              </div>
            </div>
            <div className="space-y-3">
              {registrations.map(reg => {
                const sId = reg.student?.id;
                if (!sId) return null;
                const status = attendance[sId] || 'PRESENT';
                return (
                  <div key={reg.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-700/40 rounded-xl">
                    <div className="flex-1">
                      <div className="text-white font-medium">{reg.student?.fullName}</div>
                      <div className="text-slate-400 text-xs">{reg.student?.institution} · {reg.student?.skillLevel}</div>
                    </div>
                    <div className="flex gap-2">
                      {['PRESENT', 'ABSENT', 'LATE'].map(s => (
                        <button key={s} onClick={() => setAttendance(p => ({ ...p, [sId]: s }))}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border
                            ${status === s ? `${statusClass(s)} text-white border-transparent` : 'bg-transparent border-slate-600 text-slate-400 hover:border-slate-400'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <input className="input-field text-xs py-1.5 w-full sm:w-48"
                      placeholder="Remarks (optional)"
                      value={remarks[sId] || ''}
                      onChange={e => setRemarks(p => ({ ...p, [sId]: e.target.value }))} />
                  </div>
                );
              })}
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-success w-full mt-4">
              {saving ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner" />Saving...</span> : `Save Attendance for ${date}`}
            </button>
          </div>
        ) : selectedOpp ? (
          <div className="card text-center py-12 text-slate-500">No students registered for this session yet</div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

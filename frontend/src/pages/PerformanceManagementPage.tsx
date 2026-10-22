import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentService, performanceService, coachService, opportunityService } from '../services';
import type { Student, Coach, Opportunity } from '../types';
import toast from 'react-hot-toast';

export default function PerformanceManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [form, setForm] = useState({
    studentId: '', opportunityId: '', fitnessScore: '', skillScore: '',
    matchPerformance: '', remarks: '', evaluationDate: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [selectedStudentPerf, setSelectedStudentPerf] = useState<any[]>([]);
  const [loadingPerf, setLoadingPerf] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      studentService.getAll().then(r => setStudents(r.data.data)),
      opportunityService.getAll().then(r => setOpportunities(r.data.data)),
      coachService.getMyProfile().then(r => setCoach(r.data.data)),
    ]);
  }, []);

  const loadStudentPerf = async (sid: number) => {
    setLoadingPerf(true);
    try {
      const res = await performanceService.getStudentPerformance(sid);
      setSelectedStudentPerf(res.data.data);
    } catch { setSelectedStudentPerf([]); }
    finally { setLoadingPerf(false); }
  };

  const validate = () => {
    if (!form.studentId) { toast.error('Select a student'); return false; }
    const vals = [form.fitnessScore, form.skillScore, form.matchPerformance];
    for (const v of vals) {
      const n = Number(v);
      if (v && (isNaN(n) || n < 0 || n > 10)) { toast.error('Scores must be between 0 and 10'); return false; }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await performanceService.record({
        studentId: Number(form.studentId),
        opportunityId: form.opportunityId ? Number(form.opportunityId) : undefined,
        coachId: coach?.id,
        fitnessScore: form.fitnessScore ? Number(form.fitnessScore) : undefined,
        skillScore: form.skillScore ? Number(form.skillScore) : undefined,
        matchPerformance: form.matchPerformance ? Number(form.matchPerformance) : undefined,
        remarks: form.remarks,
        evaluationDate: form.evaluationDate,
      });
      toast.success('Performance recorded! Student dashboard updated.');
      setForm(p => ({ ...p, fitnessScore: '', skillScore: '', matchPerformance: '', remarks: '' }));
      if (form.studentId) loadStudentPerf(Number(form.studentId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save performance');
    } finally { setSaving(false); }
  };

  const scoreColor = (v: string) => {
    const n = Number(v);
    if (!v) return 'text-slate-400';
    return n >= 8 ? 'text-emerald-400' : n >= 6 ? 'text-blue-400' : n >= 4 ? 'text-amber-400' : 'text-red-400';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="page-title">Performance Management</h1><p className="page-subtitle">Record and review student performance evaluations</p></div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card">
            <h2 className="section-title">Record Performance</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label">Student *</label>
                <select className="select-field" value={form.studentId}
                  onChange={e => { setForm(p => ({ ...p, studentId: e.target.value })); if (e.target.value) loadStudentPerf(Number(e.target.value)); }}>
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.institution || 'Unknown'})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Training Session (optional)</label>
                <select className="select-field" value={form.opportunityId} onChange={e => setForm(p => ({ ...p, opportunityId: e.target.value }))}>
                  <option value="">-- No specific session --</option>
                  {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Evaluation Date</label>
                <input type="date" className="input-field" value={form.evaluationDate} max={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(p => ({ ...p, evaluationDate: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'fitnessScore', label: 'Fitness Score' },
                  { key: 'skillScore', label: 'Skill Score' },
                  { key: 'matchPerformance', label: 'Match Score' },
                ].map(({ key, label }) => (
                  <div key={key} className="form-group">
                    <label className="label">{label} <span className="text-slate-500">(0–10)</span></label>
                    <input type="number" min={0} max={10} step={0.1} className={`input-field ${scoreColor(form[key as keyof typeof form] as string)}`}
                      placeholder="0–10"
                      value={form[key as keyof typeof form] as string}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="label">Coach Remarks</label>
                <textarea rows={3} className="input-field" placeholder="Feedback and observations..."
                  value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
              </div>
              {form.fitnessScore && form.skillScore && form.matchPerformance && (
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 text-center">
                  <span className="text-slate-400 text-sm">Calculated Overall Score: </span>
                  <span className="text-blue-300 font-bold text-lg">
                    {(((Number(form.fitnessScore) + Number(form.skillScore) + Number(form.matchPerformance)) / 3)).toFixed(1)}/10
                  </span>
                </div>
              )}
              <button type="submit" className="btn-success w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Record Performance'}
              </button>
            </form>
          </div>

          {/* Student History */}
          <div className="card">
            <h2 className="section-title">Student Performance History</h2>
            {!form.studentId ? (
              <div className="text-center py-12 text-slate-500">Select a student to view their performance history</div>
            ) : loadingPerf ? (
              <div className="flex items-center justify-center h-32"><div className="loading-spinner w-6 h-6" /></div>
            ) : selectedStudentPerf.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No performance records yet for this student</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {[...selectedStudentPerf].reverse().map(p => (
                  <div key={p.id} className="p-3 bg-slate-700/40 rounded-xl">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-xs">{p.evaluationDate ? new Date(p.evaluationDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                      <span className="text-blue-300 font-bold text-sm">{p.overallScore?.toFixed(1)}/10</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center mb-2">
                      <div><div className="text-slate-500">Fitness</div><div className="text-emerald-400 font-medium">{p.fitnessScore?.toFixed(1)}</div></div>
                      <div><div className="text-slate-500">Skill</div><div className="text-purple-400 font-medium">{p.skillScore?.toFixed(1)}</div></div>
                      <div><div className="text-slate-500">Match</div><div className="text-amber-400 font-medium">{p.matchPerformance?.toFixed(1)}</div></div>
                    </div>
                    {p.remarks && <div className="text-slate-400 text-xs italic">"{p.remarks}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

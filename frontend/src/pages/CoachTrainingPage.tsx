import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { opportunityService, registrationService } from '../services';
import type { Opportunity, TrainingRegistration } from '../types';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';

type FormData = Partial<Opportunity>;

const emptyForm: FormData = {
  title: '', type: 'TRAINING', organizer: '', location: '',
  skillLevel: 'BEGINNER', availableSeats: 20, totalSeats: 20, description: '', contactInfo: '',
};

export default function CoachTrainingPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewRegs, setViewRegs] = useState<{ oppId: number; regs: TrainingRegistration[] } | null>(null);

  useEffect(() => { loadOpportunities(); }, []);

  const loadOpportunities = async () => {
    try {
      const res = await opportunityService.getAllAdmin();
      setOpportunities(res.data.data);
    } catch {
      const res = await opportunityService.getAll();
      setOpportunities(res.data.data);
    } finally { setLoading(false); }
  };

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (opp: Opportunity) => { setForm({ ...opp }); setEditId(opp.id); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await opportunityService.update(editId, form);
        toast.success('Training session updated!');
      } else {
        await opportunityService.create(form);
        toast.success('Training session created!');
      }
      setShowForm(false);
      loadOpportunities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this training session?')) return;
    try {
      await opportunityService.delete(id);
      toast.success('Deleted');
      loadOpportunities();
    } catch { toast.error('Cannot delete — may have active registrations'); }
  };

  const viewRegistrations = async (oppId: number) => {
    try {
      const res = await registrationService.getOpportunityRegistrations(oppId);
      setViewRegs({ oppId, regs: res.data.data });
    } catch { toast.error('Could not load registrations'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="page-title">Training Management</h1><p className="page-subtitle">Create and manage training sessions</p></div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />Add Training
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">{editId ? 'Edit' : 'Create'} Training Session</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="form-group"><label className="label">Title *</label>
                    <input className="input-field" value={form.title || ''} required onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group"><label className="label">Type</label>
                      <select className="select-field" value={form.type || 'TRAINING'} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}>
                        <option value="TRAINING">Training</option><option value="ACADEMY">Academy</option>
                        <option value="SCHOOL_TEAM">School Team</option><option value="COLLEGE_TEAM">College Team</option>
                      </select></div>
                    <div className="form-group"><label className="label">Skill Level</label>
                      <select className="select-field" value={form.skillLevel || 'BEGINNER'} onChange={e => setForm(p => ({ ...p, skillLevel: e.target.value as any }))}>
                        <option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option><option value="ALL">All Levels</option>
                      </select></div>
                  </div>
                  <div className="form-group"><label className="label">Organizer</label>
                    <input className="input-field" value={form.organizer || ''} onChange={e => setForm(p => ({ ...p, organizer: e.target.value }))} /></div>
                  <div className="form-group"><label className="label">Location</label>
                    <input className="input-field" value={form.location || ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="form-group"><label className="label">Date</label>
                      <input type="date" className="input-field" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                    <div className="form-group"><label className="label">Start</label>
                      <input type="time" className="input-field" value={form.startTime || ''} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} /></div>
                    <div className="form-group"><label className="label">End</label>
                      <input type="time" className="input-field" value={form.endTime || ''} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} /></div>
                  </div>
                  <div className="form-group"><label className="label">Capacity (seats)</label>
                    <input type="number" min={1} className="input-field" value={form.totalSeats || 20}
                      onChange={e => { const n = Number(e.target.value); setForm(p => ({ ...p, totalSeats: n, availableSeats: n })); }} /></div>
                  <div className="form-group"><label className="label">Description</label>
                    <textarea rows={3} className="input-field" value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                  <div className="form-group"><label className="label">Contact Info</label>
                    <input className="input-field" value={form.contactInfo || ''} onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))} /></div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary flex-1" disabled={saving}>
                      {saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Registrations Modal */}
        {viewRegs && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Registered Students ({viewRegs.regs.length})</h2>
                  <button onClick={() => setViewRegs(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                {viewRegs.regs.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No students registered yet</p>
                ) : (
                  <div className="space-y-2">
                    {viewRegs.regs.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{r.student?.fullName}</div>
                          <div className="text-slate-400 text-xs">{r.student?.institution} · {r.student?.skillLevel}</div>
                        </div>
                        <div className="badge-green">{r.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="loading-spinner w-8 h-8" /></div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead><tr className="table-header">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Seats</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr></thead>
              <tbody>
                {opportunities.map(opp => (
                  <tr key={opp.id} className="table-row">
                    <td className="table-cell font-medium text-white">{opp.title}</td>
                    <td className="table-cell"><span className="badge-blue">{opp.type?.replace('_',' ')}</span></td>
                    <td className="table-cell">{opp.location || '—'}</td>
                    <td className="table-cell">{opp.date ? new Date(opp.date).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="table-cell">{opp.availableSeats}/{opp.totalSeats}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => viewRegistrations(opp.id)} className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded" title="View registrations">
                          <UsersIcon className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(opp)} className="p-1.5 text-amber-400 hover:bg-amber-900/30 rounded">
                          <PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(opp.id)} className="p-1.5 text-red-400 hover:bg-red-900/30 rounded">
                          <TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

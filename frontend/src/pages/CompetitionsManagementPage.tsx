import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { competitionService } from '../services';
import type { Competition } from '../types';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const emptyForm: Partial<Competition> = {
  title: '', organizer: '', location: '', skillLevel: 'ALL',
  description: '', prize: '', status: 'UPCOMING', maxParticipants: 100,
};

export default function CompetitionsManagementPage() {
  const [items, setItems] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Competition>>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await competitionService.getAll(); setItems(r.data.data); }
    finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await competitionService.update(editId, form); toast.success('Updated!'); }
      else { await competitionService.create(form); toast.success('Competition created!'); }
      setShowForm(false); load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this competition?')) return;
    try { await competitionService.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Cannot delete'); }
  };

  const STATUS_COLORS: Record<string, string> = { UPCOMING: 'badge-blue', ONGOING: 'badge-green', COMPLETED: 'badge-yellow', CANCELLED: 'badge-red' };

  return (
    <DashboardLayout>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">{editId ? 'Edit' : 'Create'} Competition</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="form-group"><label className="label">Title *</label><input className="input-field" value={form.title || ''} required onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div className="form-group"><label className="label">Organizer</label><input className="input-field" value={form.organizer || ''} onChange={e => setForm(p => ({ ...p, organizer: e.target.value }))} /></div>
                <div className="form-group"><label className="label">Location</label><input className="input-field" value={form.location || ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group"><label className="label">Start Date</label><input type="date" className="input-field" value={form.startDate || ''} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
                  <div className="form-group"><label className="label">End Date</label><input type="date" className="input-field" value={form.endDate || ''} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
                  <div className="form-group"><label className="label">Skill Level</label>
                    <select className="select-field" value={form.skillLevel || 'ALL'} onChange={e => setForm(p => ({ ...p, skillLevel: e.target.value as any }))}>
                      <option value="ALL">All</option><option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option>
                    </select></div>
                  <div className="form-group"><label className="label">Status</label>
                    <select className="select-field" value={form.status || 'UPCOMING'} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
                      <option>UPCOMING</option><option>ONGOING</option><option>COMPLETED</option><option>CANCELLED</option>
                    </select></div>
                </div>
                <div className="form-group"><label className="label">Max Participants</label><input type="number" min={1} className="input-field" value={form.maxParticipants || 100} onChange={e => setForm(p => ({ ...p, maxParticipants: Number(e.target.value) }))} /></div>
                <div className="form-group"><label className="label">Prize</label><input className="input-field" placeholder="e.g. Trophy + ₹50,000" value={form.prize || ''} onChange={e => setForm(p => ({ ...p, prize: e.target.value }))} /></div>
                <div className="form-group"><label className="label">Description</label><textarea rows={3} className="input-field" value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="page-title">Competitions Management</h1><p className="page-subtitle">{items.length} competitions</p></div>
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />Add Competition</button>
        </div>
        {loading ? <div className="flex items-center justify-center h-48"><div className="loading-spinner w-8 h-8" /></div> : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead><tr className="table-header">
                <th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Organizer</th>
                <th className="px-4 py-3 text-left">Dates</th><th className="px-4 py-3 text-left">Skill</th>
                <th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th>
              </tr></thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell font-medium text-white">{c.title}</td>
                    <td className="table-cell text-xs">{c.organizer || '—'}</td>
                    <td className="table-cell text-xs">{c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN') : '—'}{c.endDate ? ` – ${new Date(c.endDate).toLocaleDateString('en-IN')}` : ''}</td>
                    <td className="table-cell"><span className="badge-blue">{c.skillLevel}</span></td>
                    <td className="table-cell"><span className={`badge ${STATUS_COLORS[c.status || 'UPCOMING']}`}>{c.status}</span></td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => { setForm({ ...c }); setEditId(c.id); setShowForm(true); }} className="p-1.5 text-amber-400 hover:bg-amber-900/30 rounded"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-400 hover:bg-red-900/30 rounded"><TrashIcon className="w-4 h-4" /></button>
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

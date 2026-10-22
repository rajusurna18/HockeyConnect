import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { opportunityService } from '../services';
import type { Opportunity } from '../types';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const emptyForm: Partial<Opportunity> = {
  title: '', type: 'TRAINING', organizer: '', location: '',
  skillLevel: 'BEGINNER', availableSeats: 20, totalSeats: 20, description: '', status: 'ACTIVE',
};

export default function OpportunitiesManagementPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [filtered, setFiltered] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Opportunity>>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setFiltered(items.filter(o => o.title?.toLowerCase().includes(search.toLowerCase()) || o.location?.toLowerCase().includes(search.toLowerCase())));
  }, [search, items]);

  const load = async () => {
    setLoading(true);
    try { const r = await opportunityService.getAllAdmin(); setItems(r.data.data); }
    catch { const r = await opportunityService.getAll(); setItems(r.data.data); }
    finally { setLoading(false); }
  };

  const openEdit = (o: Opportunity) => { setForm({ ...o }); setEditId(o.id); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await opportunityService.update(editId, form); toast.success('Updated!'); }
      else { await opportunityService.create(form); toast.success('Created!'); }
      setShowForm(false); load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this opportunity?')) return;
    try { await opportunityService.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Cannot delete'); }
  };

  const FormModal = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">{editId ? 'Edit' : 'Create'} Opportunity</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="form-group"><label className="label">Title *</label><input className="input-field" value={form.title || ''} required onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group"><label className="label">Type</label>
                <select className="select-field" value={form.type || 'TRAINING'} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}>
                  <option value="TRAINING">Training</option><option value="ACADEMY">Academy</option>
                  <option value="SCHOOL_TEAM">School Team</option><option value="COLLEGE_TEAM">College Team</option>
                  <option value="COMPETITION">Competition</option><option value="TOURNAMENT">Tournament</option>
                </select></div>
              <div className="form-group"><label className="label">Skill Level</label>
                <select className="select-field" value={form.skillLevel || 'BEGINNER'} onChange={e => setForm(p => ({ ...p, skillLevel: e.target.value as any }))}>
                  <option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option><option value="ALL">All Levels</option>
                </select></div>
            </div>
            <div className="form-group"><label className="label">Organizer</label><input className="input-field" value={form.organizer || ''} onChange={e => setForm(p => ({ ...p, organizer: e.target.value }))} /></div>
            <div className="form-group"><label className="label">Location</label><input className="input-field" value={form.location || ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group"><label className="label">Date</label><input type="date" className="input-field" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Seats</label><input type="number" min={1} className="input-field" value={form.totalSeats || 20} onChange={e => { const n = Number(e.target.value); setForm(p => ({ ...p, totalSeats: n, availableSeats: n })); }} /></div>
            </div>
            <div className="form-group"><label className="label">Description</label><textarea rows={3} className="input-field" value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="form-group"><label className="label">Status</label>
              <select className="select-field" value={form.status || 'ACTIVE'} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
                <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
                <option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
              </select></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {showForm && <FormModal />}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="page-title">Opportunities Management</h1><p className="page-subtitle">{filtered.length} opportunities</p></div>
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />Add Opportunity</button>
        </div>
        <div className="card">
          <div className="relative max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input-field pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="flex items-center justify-center h-48"><div className="loading-spinner w-8 h-8" /></div> : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Location</th><th className="px-4 py-3 text-left">Skill</th>
                  <th className="px-4 py-3 text-left">Seats</th><th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.id} className="table-row">
                      <td className="table-cell font-medium text-white">{o.title}</td>
                      <td className="table-cell"><span className="badge-blue">{o.type?.replace('_',' ')}</span></td>
                      <td className="table-cell">{o.location || '—'}</td>
                      <td className="table-cell"><span className="badge-green">{o.skillLevel}</span></td>
                      <td className="table-cell">{o.availableSeats}/{o.totalSeats}</td>
                      <td className="table-cell"><span className={`badge ${o.status === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`}>{o.status}</span></td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(o)} className="p-1.5 text-amber-400 hover:bg-amber-900/30 rounded"><PencilIcon className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(o.id)} className="p-1.5 text-red-400 hover:bg-red-900/30 rounded"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

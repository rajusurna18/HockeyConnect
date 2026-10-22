import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentService } from '../services';
import type { Student } from '../types';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const SKILL_COLORS: Record<string, string> = {
  BEGINNER: 'badge-green', INTERMEDIATE: 'badge-blue', ADVANCED: 'badge-purple',
};
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'badge-green', REGISTERED: 'badge-yellow', INACTIVE: 'badge-red',
};

export default function StudentsManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  useEffect(() => { applyFilter(); }, [students, search, skillFilter]);

  const load = async () => {
    setLoading(true);
    try { const r = await studentService.getAll(); setStudents(r.data.data); }
    catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const applyFilter = () => {
    let r = students;
    if (search) r = r.filter(s => s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.institution?.toLowerCase().includes(search.toLowerCase()) || s.location?.toLowerCase().includes(search.toLowerCase()));
    if (skillFilter) r = r.filter(s => s.skillLevel === skillFilter);
    setFiltered(r);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setSaving(true);
    try {
      await studentService.update(editStudent.id, editStudent);
      toast.success('Student updated');
      setEditStudent(null);
      load();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentService.delete(id);
      toast.success('Student deleted');
      load();
    } catch { toast.error('Cannot delete — student may have active registrations'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="page-title">Students Management</h1><p className="page-subtitle">{filtered.length} of {students.length} students</p></div>
        </div>

        {/* Edit Modal */}
        {editStudent && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Edit Student: {editStudent.fullName}</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group col-span-2"><label className="label">Full Name</label>
                      <input className="input-field" value={editStudent.fullName || ''} onChange={e => setEditStudent(p => p ? { ...p, fullName: e.target.value } : p)} /></div>
                    <div className="form-group"><label className="label">Age</label>
                      <input type="number" className="input-field" value={editStudent.age || ''} onChange={e => setEditStudent(p => p ? { ...p, age: Number(e.target.value) } : p)} /></div>
                    <div className="form-group"><label className="label">Gender</label>
                      <input className="input-field" value={editStudent.gender || ''} onChange={e => setEditStudent(p => p ? { ...p, gender: e.target.value } : p)} /></div>
                    <div className="form-group col-span-2"><label className="label">Institution</label>
                      <input className="input-field" value={editStudent.institution || ''} onChange={e => setEditStudent(p => p ? { ...p, institution: e.target.value } : p)} /></div>
                    <div className="form-group"><label className="label">Skill Level</label>
                      <select className="select-field" value={editStudent.skillLevel || 'BEGINNER'} onChange={e => setEditStudent(p => p ? { ...p, skillLevel: e.target.value as any } : p)}>
                        <option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option></select></div>
                    <div className="form-group"><label className="label">Status</label>
                      <select className="select-field" value={editStudent.participationStatus || 'REGISTERED'} onChange={e => setEditStudent(p => p ? { ...p, participationStatus: e.target.value as any } : p)}>
                        <option>REGISTERED</option><option>ACTIVE</option><option>INACTIVE</option></select></div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
                    <button type="button" onClick={() => setEditStudent(null)} className="btn-secondary flex-1">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input-field pl-9" placeholder="Search name, institution, location..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select-field w-48" value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
              <option value="">All Skill Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <button onClick={() => { setSearch(''); setSkillFilter(''); }} className="btn-secondary">Reset</button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="loading-spinner w-8 h-8" /></div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Institution</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Skill</th>
                  <th className="px-4 py-3 text-left">Age</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-500">No students found</td></tr>
                  ) : filtered.map(s => (
                    <tr key={s.id} className="table-row">
                      <td className="table-cell font-medium text-white">{s.fullName}</td>
                      <td className="table-cell text-xs">{s.institution || '—'}</td>
                      <td className="table-cell">{s.location || '—'}</td>
                      <td className="table-cell"><span className={`badge ${SKILL_COLORS[s.skillLevel || 'BEGINNER']}`}>{s.skillLevel}</span></td>
                      <td className="table-cell">{s.age || '—'}</td>
                      <td className="table-cell"><span className={`badge ${STATUS_COLORS[s.participationStatus || 'REGISTERED']}`}>{s.participationStatus}</span></td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button onClick={() => setEditStudent(s)} className="p-1.5 text-amber-400 hover:bg-amber-900/30 rounded"><PencilIcon className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-400 hover:bg-red-900/30 rounded"><TrashIcon className="w-4 h-4" /></button>
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

import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { coachService } from '../services';
import type { Coach } from '../types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function CoachesManagementPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [filtered, setFiltered] = useState<Coach[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { coachService.getAll().then(r => { setCoaches(r.data.data); setFiltered(r.data.data); }).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    setFiltered(coaches.filter(c =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.institution?.toLowerCase().includes(search.toLowerCase()) ||
      c.specialization?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, coaches]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="page-title">Coaches Management</h1><p className="page-subtitle">{filtered.length} coaches on the platform</p></div>
        <div className="card">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input-field pl-9 max-w-sm" placeholder="Search coaches..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="flex items-center justify-center h-48"><div className="loading-spinner w-8 h-8" /></div> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {c.fullName?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{c.fullName}</div>
                    <div className="text-slate-400 text-xs">{c.institution}</div>
                  </div>
                </div>
                {c.specialization && <div className="badge-blue mb-2">{c.specialization}</div>}
                <div className="space-y-1 text-slate-400 text-sm">
                  {c.location && <div>📍 {c.location}</div>}
                  {c.experienceYears !== undefined && <div>⏱️ {c.experienceYears} years experience</div>}
                  {c.certifications && <div>🏅 {c.certifications}</div>}
                </div>
                {c.bio && <p className="text-slate-400 text-xs mt-2 line-clamp-2 italic">{c.bio}</p>}
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-slate-500">No coaches found</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

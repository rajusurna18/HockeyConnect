import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { opportunityService } from '../services';
import type { Opportunity, OpportunityType, OpportunitySkillLevel } from '../types';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const TYPE_LABELS: Record<string, string> = {
  TRAINING: 'Training', ACADEMY: 'Academy', SCHOOL_TEAM: 'School Team',
  COLLEGE_TEAM: 'College Team', COMPETITION: 'Competition', TOURNAMENT: 'Tournament',
};
const TYPE_COLORS: Record<string, string> = {
  TRAINING: 'badge-blue', ACADEMY: 'badge-green', SCHOOL_TEAM: 'badge-yellow',
  COLLEGE_TEAM: 'badge-purple', COMPETITION: 'badge-red', TOURNAMENT: 'badge-red',
};
const SKILL_COLORS: Record<string, string> = {
  BEGINNER: 'badge-green', INTERMEDIATE: 'badge-blue', ADVANCED: 'badge-purple', ALL: 'badge-yellow',
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filtered, setFiltered] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => { loadOpportunities(); }, []);
  useEffect(() => { applyFilters(); }, [opportunities, search, typeFilter, skillFilter, locationFilter]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await opportunityService.getAll({ type: typeFilter || undefined, skillLevel: skillFilter || undefined, location: locationFilter || undefined });
      setOpportunities(res.data.data);
    } catch { setOpportunities([]); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let result = opportunities;
    if (search) result = result.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.location?.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter) result = result.filter(o => o.type === typeFilter);
    if (skillFilter) result = result.filter(o => o.skillLevel === skillFilter || o.skillLevel === 'ALL');
    if (locationFilter) result = result.filter(o => o.location?.toLowerCase().includes(locationFilter.toLowerCase()));
    setFiltered(result);
  };

  const handleSearch = () => { loadOpportunities(); };

  const resetFilters = () => { setSearch(''); setTypeFilter(''); setSkillFilter(''); setLocationFilter(''); };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Hockey Opportunities</h1>
            <p className="page-subtitle">Discover training, academies, and competitions near you</p>
          </div>
          <span className="badge-blue">{filtered.length} found</span>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Filter Opportunities</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input-field pl-9" placeholder="Search title, location..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="select-field" value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
              <option value="">All Skill Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleSearch} className="btn-primary flex-1">Search</button>
              <button onClick={resetFilters} className="btn-secondary">Reset</button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="loading-spinner w-8 h-8" /></div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-slate-400 text-lg">No opportunities found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
            <button onClick={resetFilters} className="btn-secondary mt-4">Clear Filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(opp => (
              <div key={opp.id} className="card-hover flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${TYPE_COLORS[opp.type] || 'badge-blue'}`}>
                    {TYPE_LABELS[opp.type] || opp.type}
                  </span>
                  <span className={`badge ${SKILL_COLORS[opp.skillLevel || 'ALL'] || 'badge-yellow'}`}>
                    {opp.skillLevel || 'ALL'}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 flex-1">{opp.title}</h3>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{opp.description}</p>
                <div className="space-y-1.5 mb-4">
                  {opp.organizer && <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <UserGroupIcon className="w-3.5 h-3.5" />{opp.organizer}
                  </div>}
                  {opp.location && <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <MapPinIcon className="w-3.5 h-3.5" />{opp.location}
                  </div>}
                  {opp.date && <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {new Date(opp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {opp.startTime && ` · ${opp.startTime.substring(0,5)}`}
                  </div>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <span className={`text-sm ${(opp.availableSeats ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {opp.availableSeats ?? 0} seats left
                  </span>
                  <Link to={`/opportunities/${opp.id}`} className="btn-primary text-sm py-1.5 px-4">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

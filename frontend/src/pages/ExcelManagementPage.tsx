import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { excelService, analyticsService } from '../services';
import type { ImportResult } from '../types';
import toast from 'react-hot-toast';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ExcelManagementPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentCount, setStudentCount] = useState<number | null>(null);

  useEffect(() => {
    analyticsService.getOverview().then(r => setStudentCount(r.data.data.totalStudents)).catch(() => {});
  }, []);

  const handleImport = async () => {
    if (!selectedFile) { toast.error('Please select an Excel file first'); return; }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await excelService.importStudents(selectedFile);
      const result = res.data.data;
      setImportResult(result);
      if (result.successCount > 0) {
        toast.success(`✅ ${result.successCount} students imported successfully!`);
        // Refresh student count
        analyticsService.getOverview().then(r => setStudentCount(r.data.data.totalStudents)).catch(() => {});
      }
      if (result.errorCount > 0) toast.error(`⚠️ ${result.errorCount} rows had errors`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally { setImporting(false); }
  };

  const doExport = async (type: string) => {
    setExporting(type);
    try {
      if (type === 'students') await excelService.exportStudents();
      else if (type === 'analytics') await excelService.exportAnalytics();
      else if (type === 'template') await excelService.downloadTemplate();
      toast.success('Download started!');
    } catch { toast.error('Export failed'); }
    finally { setExporting(''); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Data Management & Excel</h1>
          <p className="page-subtitle">Import and export data using Excel files. Database is always the source of truth.</p>
        </div>

        {/* Live Demo Banner */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
          <h3 className="text-blue-300 font-semibold mb-2">📊 Live Demo Workflow</h3>
          <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
            <li>Download the student import template</li>
            <li>Add new student rows in Excel</li>
            <li>Upload the file below</li>
            <li>Check the import report</li>
            <li>Go to Analytics — student count updates automatically</li>
          </ol>
          {studentCount !== null && (
            <div className="mt-3 text-slate-400 text-sm">
              Current student count: <span className="text-blue-300 font-bold">{studentCount}</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* IMPORT */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <ArrowUpTrayIcon className="w-5 h-5 text-emerald-400" />
              <h2 className="section-title mb-0">Import Data</h2>
            </div>

            <div className="form-group">
              <label className="label">Download Template First</label>
              <button onClick={() => doExport('template')} disabled={exporting === 'template'}
                className="btn-outline w-full flex items-center justify-center gap-2">
                <DocumentIcon className="w-4 h-4" />
                {exporting === 'template' ? 'Downloading...' : 'Download Student Import Template (.xlsx)'}
              </button>
            </div>

            <div className="form-group">
              <label className="label">Select Excel File</label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all
                ${selectedFile ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-600 hover:border-blue-500'}`}>
                <input type="file" accept=".xlsx,.xls" id="excel-file" className="hidden"
                  onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
                <label htmlFor="excel-file" className="cursor-pointer">
                  {selectedFile ? (
                    <div>
                      <CheckCircleIcon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-emerald-300 font-medium">{selectedFile.name}</p>
                      <p className="text-slate-400 text-xs mt-1">{(selectedFile.size / 1024).toFixed(1)} KB · Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <ArrowUpTrayIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-300">Click to choose .xlsx or .xls file</p>
                      <p className="text-slate-500 text-xs mt-1">Max 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button onClick={handleImport} disabled={!selectedFile || importing} className="btn-success w-full">
              {importing ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner" />Importing...</span> : 'Import Students'}
            </button>

            {/* Import Result */}
            {importResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-white font-bold text-xl">{importResult.totalRows}</div>
                    <div className="text-slate-400 text-xs">Total Rows</div>
                  </div>
                  <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-3 text-center">
                    <div className="text-emerald-400 font-bold text-xl">{importResult.successCount}</div>
                    <div className="text-slate-400 text-xs">Successful</div>
                  </div>
                  <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-center">
                    <div className="text-red-400 font-bold text-xl">{importResult.errorCount}</div>
                    <div className="text-slate-400 text-xs">Errors</div>
                  </div>
                </div>

                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
                    <h4 className="text-red-300 font-medium mb-2 flex items-center gap-2">
                      <XCircleIcon className="w-4 h-4" />Error Details
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {importResult.errors.map((e, i) => (
                        <div key={i} className="text-red-400 text-xs py-1 border-b border-red-900/50">{e}</div>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.successCount > 0 && (
                  <div className="alert-success flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Analytics dashboard updated — check the student count!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* EXPORT */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <ArrowDownTrayIcon className="w-5 h-5 text-blue-400" />
              <h2 className="section-title mb-0">Export Data</h2>
            </div>

            <p className="text-slate-400 text-sm">Download current database data as Excel files for analysis or backup.</p>

            <div className="space-y-3">
              {[
                { key: 'students', label: 'Export All Students', desc: 'Student profiles, skill levels, institutions', color: 'btn-primary' },
                { key: 'analytics', label: 'Export Analytics Report', desc: 'KPIs, charts data, participation stats', color: 'btn-success' },
              ].map(({ key, label, desc, color }) => (
                <div key={key} className="flex items-center gap-4 p-4 bg-slate-700/40 rounded-xl">
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{label}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{desc}</div>
                  </div>
                  <button onClick={() => doExport(key)} disabled={exporting === key}
                    className={`${color} text-sm py-2 px-4 flex items-center gap-2`}>
                    {exporting === key ? <div className="loading-spinner" /> : <ArrowDownTrayIcon className="w-4 h-4" />}
                    {exporting === key ? '...' : 'Export'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-slate-700/30 rounded-xl">
              <h3 className="text-slate-300 font-medium text-sm mb-2">ℹ️ About Excel Integration</h3>
              <ul className="text-slate-400 text-xs space-y-1">
                <li>• Excel files are generated from the live database</li>
                <li>• Imports validate each row before saving</li>
                <li>• Duplicate students are skipped automatically</li>
                <li>• Analytics update immediately after import</li>
                <li>• MySQL/H2 database is always the source of truth</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

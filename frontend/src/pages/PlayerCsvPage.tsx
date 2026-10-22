import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { playerCsvService, type PlayerCsvImportResult } from '../services';
import toast from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function PlayerCsvPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<PlayerCsvImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only CSV files (.csv) are supported');
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
    setImportResult(null);
    setImportError(null);
  };

  const handleImport = async () => {
    if (!selectedFile) { toast.error('Please select a CSV file first'); return; }
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const res = await playerCsvService.importPlayers(selectedFile);
      const result = res.data;
      setImportResult(result);
      if (result.saved > 0 || result.updated > 0) {
        toast.success('Import complete: ' + result.saved + ' saved, ' + result.updated + ' updated');
      } else {
        toast('Import complete', { icon: 'i' });
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Import failed. Please check the CSV format.';
      setImportError(message);
      toast.error(message);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await playerCsvService.exportPlayers();
      toast.success('Download started!');
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Player CSV Management</h1>
          <p className="page-subtitle">Import and export hockey player records using CSV files.</p>
        </div>
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
          <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" />CSV Format
          </h3>
          <code className="block bg-slate-900 rounded p-2 text-emerald-300 text-xs font-mono">
            PlayerID,Name,Age,Position,TeamID,JerseyNumber
          </code>
          <ul className="text-slate-400 text-xs mt-2 space-y-1">
            <li>PlayerID and Name are required; others are optional</li>
            <li>Existing PlayerIDs are updated; new ones are inserted</li>
          </ul>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <ArrowUpTrayIcon className="w-5 h-5 text-emerald-400" />
              <h2 className="section-title mb-0">Import Players</h2>
            </div>
            <div className="form-group">
              <label className="label">Select CSV File</label>
              <div className={"border-2 border-dashed rounded-xl p-6 text-center transition-all " + (selectedFile ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-600 hover:border-blue-500')}>
                <input type="file" accept=".csv" id="player-csv-file" className="hidden" onChange={handleFileChange} />
                <label htmlFor="player-csv-file" className="cursor-pointer">
                  {selectedFile ? (
                    <div>
                      <CheckCircleIcon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-emerald-300 font-medium">{selectedFile.name}</p>
                      <p className="text-slate-400 text-xs mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <ArrowUpTrayIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-300">Click to choose a .csv file</p>
                      <p className="text-slate-500 text-xs mt-1">Max 10 MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <button id="import-players-btn" onClick={handleImport} disabled={!selectedFile || importing} className="btn-success w-full">
              {importing ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner" />Importing...</span> : 'Import Players'}
            </button>
            {importError && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 flex gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{importError}</p>
              </div>
            )}
            {importResult && (
              <div className="space-y-3">
                <h4 className="text-slate-300 font-medium text-sm">Import Summary</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-white font-bold text-xl">{importResult.totalRows}</div>
                    <div className="text-slate-400 text-xs">Total Rows</div>
                  </div>
                  <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-3 text-center">
                    <div className="text-emerald-400 font-bold text-xl">{importResult.saved}</div>
                    <div className="text-slate-400 text-xs">New Records</div>
                  </div>
                  <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 text-center">
                    <div className="text-blue-400 font-bold text-xl">{importResult.updated}</div>
                    <div className="text-slate-400 text-xs">Updated</div>
                  </div>
                </div>
                {(importResult.saved > 0 || importResult.updated > 0) && (
                  <div className="alert-success flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />{importResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <ArrowDownTrayIcon className="w-5 h-5 text-blue-400" />
              <h2 className="section-title mb-0">Export Players</h2>
            </div>
            <p className="text-slate-400 text-sm">Download all player records as a CSV file.</p>
            <div className="p-4 bg-slate-700/40 rounded-xl flex items-center gap-4">
              <div className="flex-1">
                <div className="text-white font-medium text-sm">Export All Players</div>
                <div className="text-slate-400 text-xs mt-0.5">PlayerID, Name, Age, Position, TeamID, JerseyNumber</div>
              </div>
              <button id="export-players-btn" onClick={handleExport} disabled={exporting} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                {exporting ? <div className="loading-spinner" /> : <ArrowDownTrayIcon className="w-4 h-4" />}
                {exporting ? '...' : 'Export CSV'}
              </button>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-xl">
              <h3 className="text-slate-300 font-medium text-sm mb-2">About Player CSV</h3>
              <ul className="text-slate-400 text-xs space-y-1">
                <li>Upsert logic: existing PlayerIDs are updated, new ones inserted</li>
                <li>Invalid rows are rejected with a clear error (not silently skipped)</li>
                <li>This is separate from the Student Excel import/export</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

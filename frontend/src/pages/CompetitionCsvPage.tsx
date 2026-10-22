import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { competitionCsvService, type ResultsCsvImportResult } from '../services';
import toast from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

export default function CompetitionCsvPage() {
  // Results import state
  const [resultsFile, setResultsFile] = useState<File | null>(null);
  const [importingResults, setImportingResults] = useState(false);
  const [importResult, setImportResult] = useState<ResultsCsvImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportingComp, setExportingComp] = useState(false);
  const [exportingResults, setExportingResults] = useState(false);

  const handleResultsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only CSV files (.csv) are supported');
      e.target.value = '';
      return;
    }
    setResultsFile(file);
    setImportResult(null);
    setImportError(null);
  };

  const handleResultsImport = async () => {
    if (!resultsFile) { toast.error('Please select a CSV file first'); return; }
    setImportingResults(true);
    setImportResult(null);
    setImportError(null);
    try {
      const res = await competitionCsvService.importResults(resultsFile);
      const result = res.data;
      setImportResult(result);
      if (result.updated > 0) {
        toast.success('Results updated: ' + result.updated + ' records');
      }
      if (result.failed > 0) {
        toast.error(result.failed + ' rows failed');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Import failed. Please check the CSV format.';
      setImportError(message);
      toast.error(message);
    } finally {
      setImportingResults(false);
    }
  };

  const handleExportCompetitions = async () => {
    setExportingComp(true);
    try {
      await competitionCsvService.exportCompetitions();
      toast.success('Download started!');
    } catch {
      toast.error('Export failed');
    } finally {
      setExportingComp(false);
    }
  };

  const handleExportResults = async () => {
    setExportingResults(true);
    try {
      await competitionCsvService.exportResults();
      toast.success('Download started!');
    } catch {
      toast.error('Export failed');
    } finally {
      setExportingResults(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Competition & Results CSV</h1>
          <p className="page-subtitle">Export competitions and results, import result updates via CSV.</p>
        </div>

        {/* CSV Format Info */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
          <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" />Results Import Format
          </h3>
          <code className="block bg-slate-900 rounded p-2 text-emerald-300 text-xs font-mono">
            RegistrationID,Result,Rank,Status
          </code>
          <ul className="text-slate-400 text-xs mt-2 space-y-1">
            <li><strong className="text-slate-300">RegistrationID</strong> — required, from exported results CSV</li>
            <li><strong className="text-slate-300">Result</strong> — optional text (e.g. Gold, Winner)</li>
            <li><strong className="text-slate-300">Rank</strong> — optional integer</li>
            <li><strong className="text-slate-300">Status</strong> — optional: REGISTERED, CONFIRMED, PARTICIPATED, WITHDRAWN</li>
          </ul>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* EXPORTS */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <ArrowDownTrayIcon className="w-5 h-5 text-blue-400" />
              <h2 className="section-title mb-0">Export Data</h2>
            </div>
            <p className="text-slate-400 text-sm">Download competitions and results as CSV files.</p>

            <div className="space-y-3">
              <div className="p-4 bg-slate-700/40 rounded-xl flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 text-yellow-400" />Export All Competitions
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">ID, Title, Organizer, Dates, Status, Prize</div>
                </div>
                <button id="export-competitions-btn" onClick={handleExportCompetitions} disabled={exportingComp}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                  {exportingComp ? <div className="loading-spinner" /> : <ArrowDownTrayIcon className="w-4 h-4" />}
                  {exportingComp ? '...' : 'Export CSV'}
                </button>
              </div>

              <div className="p-4 bg-slate-700/40 rounded-xl flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 text-emerald-400" />Export All Results
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">RegistrationID, Student, Competition, Result, Rank</div>
                </div>
                <button id="export-results-btn" onClick={handleExportResults} disabled={exportingResults}
                  className="btn-success text-sm py-2 px-4 flex items-center gap-2">
                  {exportingResults ? <div className="loading-spinner" /> : <ArrowDownTrayIcon className="w-4 h-4" />}
                  {exportingResults ? '...' : 'Export CSV'}
                </button>
              </div>
            </div>
          </div>

          {/* RESULTS IMPORT */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <ArrowUpTrayIcon className="w-5 h-5 text-emerald-400" />
              <h2 className="section-title mb-0">Import Results</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Update result, rank, and status for existing competition registrations.
              Export results first to get the RegistrationIDs.
            </p>

            <div className="form-group">
              <label className="label">Select CSV File</label>
              <div className={"border-2 border-dashed rounded-xl p-6 text-center transition-all " +
                (resultsFile ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-600 hover:border-blue-500')}>
                <input type="file" accept=".csv" id="results-csv-file" className="hidden" onChange={handleResultsFileChange} />
                <label htmlFor="results-csv-file" className="cursor-pointer">
                  {resultsFile ? (
                    <div>
                      <CheckCircleIcon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-emerald-300 font-medium">{resultsFile.name}</p>
                      <p className="text-slate-400 text-xs mt-1">{(resultsFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <ArrowUpTrayIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-300">Click to choose a .csv file</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button id="import-results-btn" onClick={handleResultsImport} disabled={!resultsFile || importingResults}
              className="btn-success w-full">
              {importingResults ? <span className="flex items-center justify-center gap-2"><div className="loading-spinner" />Importing...</span> : 'Import Results'}
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
                    <div className="text-emerald-400 font-bold text-xl">{importResult.updated}</div>
                    <div className="text-slate-400 text-xs">Updated</div>
                  </div>
                  <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-center">
                    <div className="text-red-400 font-bold text-xl">{importResult.failed}</div>
                    <div className="text-slate-400 text-xs">Failed</div>
                  </div>
                </div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
                    <h4 className="text-red-300 font-medium mb-2 text-sm">Row Errors</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {importResult.errors.map((e, i) => (
                        <div key={i} className="text-red-400 text-xs py-1 border-b border-red-900/50">{e}</div>
                      ))}
                    </div>
                  </div>
                )}
                {importResult.updated > 0 && (
                  <div className="alert-success flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />{importResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

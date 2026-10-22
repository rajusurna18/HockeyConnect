import api from './api';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest,
  Student, Coach, Opportunity, Competition, TrainingRegistration,
  CompetitionRegistration, Attendance, Performance, AnalyticsOverview,
  ImportResult } from '../types';

// ============= AUTH =============
export const authService = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),
};

// ============= STUDENTS =============
export const studentService = {
  getAll: () => api.get<ApiResponse<Student[]>>('/students'),
  getById: (id: number) => api.get<ApiResponse<Student>>(`/students/${id}`),
  getMyProfile: () => api.get<ApiResponse<Student>>('/students/me'),
  createOrUpdateProfile: (data: Partial<Student>) =>
    api.post<ApiResponse<Student>>('/students/profile', data),
  update: (id: number, data: Partial<Student>) =>
    api.put<ApiResponse<Student>>(`/students/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/students/${id}`),
  getRecommendations: () =>
    api.get<ApiResponse<Opportunity[]>>('/students/recommendations'),
};

// ============= COACHES =============
export const coachService = {
  getAll: () => api.get<ApiResponse<Coach[]>>('/coaches'),
  getById: (id: number) => api.get<ApiResponse<Coach>>(`/coaches/${id}`),
  getMyProfile: () => api.get<ApiResponse<Coach>>('/coaches/me'),
  createOrUpdateProfile: (data: Partial<Coach>) =>
    api.post<ApiResponse<Coach>>('/coaches/profile', data),
};

// ============= OPPORTUNITIES =============
export const opportunityService = {
  getAll: (params?: { type?: string; skillLevel?: string; location?: string }) =>
    api.get<ApiResponse<Opportunity[]>>('/opportunities', { params }),
  getAllAdmin: () => api.get<ApiResponse<Opportunity[]>>('/opportunities/all'),
  getById: (id: number) => api.get<ApiResponse<Opportunity>>(`/opportunities/${id}`),
  create: (data: Partial<Opportunity>) =>
    api.post<ApiResponse<Opportunity>>('/opportunities', data),
  update: (id: number, data: Partial<Opportunity>) =>
    api.put<ApiResponse<Opportunity>>(`/opportunities/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/opportunities/${id}`),
};

// ============= COMPETITIONS =============
export const competitionService = {
  getAll: () => api.get<ApiResponse<Competition[]>>('/competitions'),
  getById: (id: number) => api.get<ApiResponse<Competition>>(`/competitions/${id}`),
  create: (data: Partial<Competition>) =>
    api.post<ApiResponse<Competition>>('/competitions', data),
  update: (id: number, data: Partial<Competition>) =>
    api.put<ApiResponse<Competition>>(`/competitions/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/competitions/${id}`),
};

// ============= REGISTRATIONS =============
export const registrationService = {
  registerForTraining: (opportunityId: number) =>
    api.post<ApiResponse<TrainingRegistration>>('/registrations/training', { opportunityId }),
  getMyTrainings: () =>
    api.get<ApiResponse<TrainingRegistration[]>>('/registrations/training/my'),
  getOpportunityRegistrations: (oppId: number) =>
    api.get<ApiResponse<TrainingRegistration[]>>(`/registrations/training/opportunity/${oppId}`),
  registerForCompetition: (competitionId: number) =>
    api.post<ApiResponse<CompetitionRegistration>>('/registrations/competition', { competitionId }),
  getMyCompetitions: () =>
    api.get<ApiResponse<CompetitionRegistration[]>>('/registrations/competition/my'),
  getCompetitionRegistrations: (compId: number) =>
    api.get<ApiResponse<CompetitionRegistration[]>>(`/registrations/competition/${compId}`),
  updateResult: (regId: number, result: string, rank?: number) =>
    api.put<ApiResponse<CompetitionRegistration>>(`/registrations/competition/${regId}/result`, { result, rank }),
};

// ============= ATTENDANCE =============
export const attendanceService = {
  mark: (data: {
    studentId: number;
    opportunityId: number;
    date: string;
    status: string;
    remarks?: string;
    coachId?: number;
  }) => api.post<ApiResponse<Attendance>>('/attendance', data),
  getStudentAttendance: (studentId: number) =>
    api.get<ApiResponse<Attendance[]>>(`/attendance/student/${studentId}`),
  getStudentPercentage: (studentId: number) =>
    api.get<ApiResponse<number>>(`/attendance/student/${studentId}/percentage`),
  getOpportunityAttendance: (oppId: number) =>
    api.get<ApiResponse<Attendance[]>>(`/attendance/opportunity/${oppId}`),
};

// ============= PERFORMANCE =============
export const performanceService = {
  record: (data: {
    studentId: number;
    coachId?: number;
    opportunityId?: number;
    fitnessScore?: number;
    skillScore?: number;
    matchPerformance?: number;
    remarks?: string;
    evaluationDate?: string;
  }) => api.post<ApiResponse<Performance>>('/performance', data),
  getStudentPerformance: (studentId: number) =>
    api.get<ApiResponse<Performance[]>>(`/performance/student/${studentId}`),
  getAverageScore: (studentId: number) =>
    api.get<ApiResponse<number>>(`/performance/student/${studentId}/average`),
};

// ============= ANALYTICS =============
export const analyticsService = {
  getOverview: () => api.get<ApiResponse<AnalyticsOverview>>('/analytics/overview'),
};

// ============= EXCEL =============
export const excelService = {
  importStudents: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ApiResponse<ImportResult>>('/excel/import/students', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportStudents: async () => {
    const response = await api.get('/excel/export/students', { responseType: 'blob' });
    downloadBlob(response.data, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
  },
  exportAnalytics: async () => {
    const response = await api.get('/excel/export/analytics', { responseType: 'blob' });
    downloadBlob(response.data, `analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  },
  downloadTemplate: async () => {
    const response = await api.get('/excel/template/students', { responseType: 'blob' });
    downloadBlob(response.data, 'student_import_template.xlsx');
  },
};

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ============= PLAYER CSV =============
export interface PlayerCsvImportResult {
  message: string;
  totalRows: number;
  saved: number;
  updated: number;
}

export const playerCsvService = {
  importPlayers: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    // Do NOT set Content-Type manually — let Axios set multipart boundary
    return api.post<PlayerCsvImportResult>('/csv/players/import', form);
  },
  exportPlayers: async () => {
    const response = await api.get('/csv/players/export', { responseType: 'blob' });
    downloadBlob(response.data, `hockey-players_${new Date().toISOString().split('T')[0]}.csv`);
  },
};

// ============= COMPETITION & RESULTS CSV =============
export interface ResultsCsvImportResult {
  message: string;
  totalRows: number;
  updated: number;
  failed: number;
  errors: string[];
}

export const competitionCsvService = {
  exportCompetitions: async () => {
    const response = await api.get('/csv/competitions/export', { responseType: 'blob' });
    downloadBlob(response.data, `hockey-competitions_${new Date().toISOString().split('T')[0]}.csv`);
  },
  exportResults: async () => {
    const response = await api.get('/csv/results/export', { responseType: 'blob' });
    downloadBlob(response.data, `hockey-results_${new Date().toISOString().split('T')[0]}.csv`);
  },
  importResults: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ResultsCsvImportResult>('/csv/results/import', form);
  },
};

// ============= AUTH TYPES =============
export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'COACH' | 'ADMIN';
  profileComplete: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

// ============= USER TYPES =============
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'STUDENT' | 'COACH' | 'ADMIN';
  active: boolean;
  createdAt: string;
}

// ============= STUDENT TYPES =============
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ParticipationStatus = 'REGISTERED' | 'ACTIVE' | 'INACTIVE';

export interface Student {
  id: number;
  user?: User;
  fullName: string;
  age?: number;
  gender?: string;
  institution?: string;
  location?: string;
  phone?: string;
  skillLevel?: SkillLevel;
  experienceYears?: number;
  preferredDays?: string;
  preferredTime?: string;
  participationStatus?: ParticipationStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ============= COACH TYPES =============
export interface Coach {
  id: number;
  user?: User;
  fullName: string;
  phone?: string;
  specialization?: string;
  location?: string;
  institution?: string;
  experienceYears?: number;
  certifications?: string;
  bio?: string;
  createdAt?: string;
}

// ============= OPPORTUNITY TYPES =============
export type OpportunityType = 'TRAINING' | 'ACADEMY' | 'SCHOOL_TEAM' | 'COLLEGE_TEAM' | 'COMPETITION' | 'TOURNAMENT';
export type OpportunitySkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL';
export type OpportunityStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Opportunity {
  id: number;
  title: string;
  type: OpportunityType;
  organizer?: string;
  location?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  skillLevel?: OpportunitySkillLevel;
  availableSeats?: number;
  totalSeats?: number;
  description?: string;
  contactInfo?: string;
  status?: OpportunityStatus;
  coach?: Coach;
  createdAt?: string;
}

// ============= COMPETITION TYPES =============
export type CompetitionStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Competition {
  id: number;
  title: string;
  organizer?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  skillLevel?: OpportunitySkillLevel;
  maxParticipants?: number;
  description?: string;
  contactInfo?: string;
  prize?: string;
  status?: CompetitionStatus;
  createdAt?: string;
}

// ============= REGISTRATION TYPES =============
export interface TrainingRegistration {
  id: number;
  student?: Student;
  opportunity?: Opportunity;
  status: string;
  registeredAt: string;
}

export interface CompetitionRegistration {
  id: number;
  student?: Student;
  competition?: Competition;
  status: string;
  result?: string;
  rank?: number;
  registeredAt: string;
}

// ============= ATTENDANCE TYPES =============
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface Attendance {
  id: number;
  student?: Student;
  opportunity?: Opportunity;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  markedBy?: Coach;
  createdAt?: string;
}

// ============= PERFORMANCE TYPES =============
export interface Performance {
  id: number;
  student?: Student;
  opportunity?: Opportunity;
  coach?: Coach;
  evaluationDate?: string;
  fitnessScore?: number;
  skillScore?: number;
  matchPerformance?: number;
  overallScore?: number;
  remarks?: string;
  createdAt?: string;
}

// ============= ANALYTICS TYPES =============
export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface MonthlyRegistration {
  month: string;
  registrations: number;
}

export interface AnalyticsOverview {
  totalStudents: number;
  activeStudents: number;
  totalCoaches: number;
  totalOpportunities: number;
  totalCompetitions: number;
  totalRegistrations: number;
  totalCompetitionRegistrations: number;
  averageAttendance: number;
  beginnerStudents: number;
  intermediateStudents: number;
  advancedStudents: number;
  studentsBySkillLevel: ChartDataPoint[];
  studentsByInstitution: ChartDataPoint[];
  studentsByLocation: ChartDataPoint[];
  monthlyRegistrations: MonthlyRegistration[];
  opportunitiesByType: ChartDataPoint[];
}

// ============= API RESPONSE TYPES =============
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  successes: string[];
}

// ============= AUTH CONTEXT =============
export interface AuthContextType {
  user: AuthResponse | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

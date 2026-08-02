export type PYQWeightage = 'High' | 'Medium' | 'Normal';

export interface SyllabusTopic {
  id: string;
  subject: string;
  topic: string;
  pyq: PYQWeightage;
  microTopics?: string[];
}

export type SyllabusData = Record<string, { id: string; title: string; pyq: string; microTopics?: string[] }[]>;

export interface DailyInputs {
  lectures: number;
  videoHrs: number;
  bookHrs: number;
  revHrs: number;
  awHrs: number;
  caHrs: number;
  mockHrs: number;
}

export interface DailyLog {
  date: string;
  topics: number;
  lectures: number;
  videoHrs: number;
  bookHrs: number;
  revHrs: number;
  awHrs: number;
  caHrs: number;
  mockHrs: number;
  workScore: number;
  xp: number;
  streak: number;
}

export interface MockTest {
  id: string;
  name: string;
  score: number;
  maxScore?: number;
  date: string;
  subject?: string;
  notes?: string;
}

export interface AppConfig {
  targetLectures: number;
  avgLecDuration: number;
  targetBookHrs: number;
  targetRevHrs: number;
  targetAWHours: number;
  targetCAHrs: number;
  targetMockHrs: number;
  xpPerTopic: number;
  xpPerLec: number;
}

export interface AppStateData {
  completedTopics: string[];
  starredTopics: string[];
  weakTopics: string[];
  totalLecturesDone: number;
  totalVideoHours: number;
  totalBookHours: number;
  totalRevHours: number;
  totalAWHours: number;
  totalCAHours: number;
  totalMockHrs: number;
  streakCount: number;
  longestStreak: number;
  lastActiveDate: string;
  missedDays: number;
  totalActiveDays: number;
  netXP: number;
  daily: DailyInputs;
  mockTests: MockTest[];
  config: AppConfig;
}

export interface AnalyticsSummary {
  totalWorkload: number;
  completedWork: number;
  remainingWork: number;
  weightedProductivity: number;
  remainingDays: number;
  estimatedFinishDate: string;
  overallProgressPct: number;
  isRecoveryMode: boolean;
  paceBottleneck: string;
  requiredDailyWorkScore: number;
  requiredDailyLectures: number;
  requiredDailyBookHrs: number;
  requiredDailyRevHrs: number;
  requiredDailyTotalHours: number;
  todayWorkScore: number;
  currentStreak: number;
  longestStreak: number;
  missedDays: number;
  activeDays: number;
  rankTitle: string;
  rankLevel: number;
  rankXpPct: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
  topicProgressPct: number;
  activeLectures: number;
  activeVideoHrs: number;
  activeBookHrs: number;
  activeRevHrs: number;
  activeAWHrs: number;
  activeCAHrs: number;
  activeMockHrs: number;
}

export interface ServerLoadResponse {
  state?: Partial<AppStateData>;
  syllabus?: SyllabusData;
  logs?: DailyLog[];
  serverTime?: string;
  timezone?: string;
  error?: string;
}

export interface StudySession {
  id: string;
  subject: string;
  category: 'Book Reading' | 'Video Lecture' | 'Revision' | 'Answer Writing' | 'Current Affairs' | 'Mock Test' | 'Other';
  durationSeconds: number;
  date: string;
  timestamp: string;
  notes?: string;
  laps?: number[];
}

export interface AiCoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

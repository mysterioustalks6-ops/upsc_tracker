import { AppConfig, AppStateData } from '../types';

export const DEFAULT_CONFIG: AppConfig = {
  targetLectures: 1800,
  avgLecDuration: 2.5,
  targetBookHrs: 1500,
  targetRevHrs: 500,
  targetAWHours: 500,
  targetCAHrs: 500,
  targetMockHrs: 200,
  xpPerTopic: 100,
  xpPerLec: 50
};

export const INITIAL_STATE: AppStateData = {
  completedTopics: ['gs1_hist_01', 'gs1_hist_02', 'gs2_pol_01', 'gs2_pol_02', 'gs3_eco_01'],
  starredTopics: ['gs1_hist_03', 'gs2_pol_03', 'gs3_eco_02'],
  weakTopics: ['gs3_sci_03', 'csat_02'],
  totalLecturesDone: 120,
  totalVideoHours: 300,
  totalBookHours: 250,
  totalRevHours: 80,
  totalAWHours: 40,
  totalCAHours: 60,
  totalMockHrs: 15,
  streakCount: 5,
  longestStreak: 12,
  lastActiveDate: new Date().toISOString().split('T')[0],
  missedDays: 2,
  totalActiveDays: 28,
  netXP: 8400,
  daily: {
    lectures: 2,
    videoHrs: 5.0,
    bookHrs: 3.5,
    revHrs: 1.5,
    awHrs: 1.0,
    caHrs: 1.0,
    mockHrs: 0.0
  },
  mockTests: [
    { id: 'm1', name: 'Vision GS Prelims Test 01', score: 98.5, maxScore: 200, date: '15 Jul 2026', subject: 'Polity & History', notes: 'Need more revision on Ancient Art & Culture.' },
    { id: 'm2', name: 'ForumIAS SFG Test 04', score: 112.0, maxScore: 200, date: '24 Jul 2026', subject: 'Economy & Budget', notes: 'Strong accuracy in Banking & Monetary Policy.' }
  ],
  config: DEFAULT_CONFIG
};

export const DEFAULT_CONFIG = {
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

export const INITIAL_STATE = {
  completedTopics: [],
  starredTopics: [],
  weakTopics: [],
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
    lectures: 0,
    videoHrs: 0,
    bookHrs: 0,
    revHrs: 0,
    awHrs: 0,
    caHrs: 0,
    mockHrs: 0
  },
  mockTests: [],
  config: DEFAULT_CONFIG
};

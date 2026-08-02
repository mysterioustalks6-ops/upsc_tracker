import { AnalyticsSummary, AppStateData, DailyLog, SyllabusData } from '../types';

export const WORKLOAD_WEIGHTS = {
  vid: 1.00,
  book: 0.80,
  rev: 1.20,
  aw: 1.40,
  ca: 0.90,
  mock: 1.50,
  topic: 3.50 // Each completed syllabus topic contributes 3.5 work score
};

export const safeNum = (val: unknown, fallback = 0): number => {
  const n = Number(val);
  return isNaN(n) || !isFinite(n) ? fallback : n;
};

export function computeAnalytics(
  state: AppStateData,
  syllabus: SyllabusData,
  logs: DailyLog[] = [],
  serverTimeIso?: string
): AnalyticsSummary {
  const safeState = state || ({} as AppStateData);
  const safeSyllabus = syllabus || ({} as SyllabusData);
  const safeLogs = Array.isArray(logs) ? logs : [];

  const c = safeState.config || ({} as any);
  const dy = safeState.daily || ({} as any);

  // 1. Topic Progress & Sub-topic Workload Calculation
  // Rule: Each sub-topic = 2.5 hours. Topic total time = Number of Sub-topics * 2.5 hours.
  const DEFAULT_SUBTOPIC_HOURS = 2.5;

  let totalTopicsCount = 0;
  let totalSubTopicsCount = 0;
  let totalTopicWorkloadHours = 0;

  let completedTopicsCount = 0;
  let completedSubTopicsCount = 0;
  let completedTopicWorkloadHours = 0;

  const completedTopicIdsSet = new Set(safeState.completedTopics || []);

  Object.values(safeSyllabus).forEach((items) => {
    if (Array.isArray(items)) {
      items.forEach((t: any) => {
        totalTopicsCount += 1;
        const subTopicsCount = (t.microTopics && Array.isArray(t.microTopics) && t.microTopics.length > 0)
          ? t.microTopics.length
          : 1;
        const topicHours = subTopicsCount * DEFAULT_SUBTOPIC_HOURS;

        totalSubTopicsCount += subTopicsCount;
        totalTopicWorkloadHours += topicHours;

        if (completedTopicIdsSet.has(t.id)) {
          completedTopicsCount += 1;
          completedSubTopicsCount += subTopicsCount;
          completedTopicWorkloadHours += topicHours;
        }
      });
    }
  });

  if (totalTopicsCount === 0) totalTopicsCount = 1; // Safeguard
  if (totalTopicWorkloadHours === 0) totalTopicWorkloadHours = 2.5;

  const remainingTopicsCount = Math.max(0, totalTopicsCount - completedTopicsCount);
  const remainingSubTopicsCount = Math.max(0, totalSubTopicsCount - completedSubTopicsCount);
  const remainingTopicWorkloadHours = Math.max(0, totalTopicWorkloadHours - completedTopicWorkloadHours);

  const topicProgressPct = Math.round((completedTopicsCount / totalTopicsCount) * 100);

  // 2. Active Daily Logs (Lectures, Books, Revision, Mock tests serve as Effort Rewards & Bonus XP)
  const actLec = safeNum(state.totalLecturesDone) + safeNum(dy.lectures);
  const actVid = safeNum(state.totalVideoHours) + safeNum(dy.videoHrs);
  const actBook = safeNum(state.totalBookHours) + safeNum(dy.bookHrs);
  const actRev = safeNum(state.totalRevHours) + safeNum(dy.revHrs);
  const actAw = safeNum(state.totalAWHours) + safeNum(dy.awHrs);
  const actCa = safeNum(state.totalCAHours) + safeNum(dy.caHrs);
  const actMock = safeNum(state.totalMockHrs) + safeNum(dy.mockHrs);

  // Daily logged hours calculation
  const todayLoggedHours =
    safeNum(dy.videoHrs) +
    safeNum(dy.bookHrs) +
    safeNum(dy.revHrs) +
    safeNum(dy.awHrs) +
    safeNum(dy.caHrs) +
    safeNum(dy.mockHrs);

  const totalLoggedHoursAllTime =
    actVid + actBook + actRev + actAw + actCa + actMock;

  // Total Workload in hours
  const totalWorkload = totalTopicWorkloadHours;
  const completedWork = completedTopicWorkloadHours;
  const remainingWork = remainingTopicWorkloadHours;

  // 3. Days & Active tracking
  const startLogDate = safeLogs.length > 0 && safeLogs[0]?.date ? new Date(safeLogs[0].date) : new Date();
  const totalDaysPassed = Math.max(1, Math.floor((new Date().getTime() - startLogDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  let activeDays = safeNum(safeState.totalActiveDays) + (todayLoggedHours > 0 || completedTopicsCount > 0 ? 1 : 0);
  if (activeDays === 0) activeDays = 1;
  const missedDays = Math.max(0, totalDaysPassed - activeDays);

  // 4. Real Average Daily Study Hours & Dynamic Estimated Completion Date
  // Total work done = logged study hours or topic workload hours completed
  const totalEffectiveStudyHours = Math.max(totalLoggedHoursAllTime, completedTopicWorkloadHours + todayLoggedHours);
  
  // Calculate historical overall average daily study hours
  const overallAvgDailyHours = totalEffectiveStudyHours / Math.max(1, activeDays);

  // Calculate recent 7-day average daily study hours if logs exist
  let recent7DaysHoursSum = todayLoggedHours;
  let recentDaysCount = 1;
  const logsReversed = [...safeLogs].reverse();
  for (let i = 0; i < Math.min(6, logsReversed.length); i++) {
    const l = logsReversed[i];
    const logHrs = safeNum(l.videoHrs) + safeNum(l.bookHrs) + safeNum(l.revHrs) + safeNum(l.awHrs) + safeNum(l.caHrs) + safeNum(l.mockHrs) + (safeNum(l.workScore) > 0 ? 2.5 : 0);
    recent7DaysHoursSum += logHrs;
    recentDaysCount++;
  }
  const recentAvgDailyHours = recent7DaysHoursSum / recentDaysCount;

  // Default target pace if user is brand new (6.0 hours/day)
  const defaultTargetPace = safeNum(c.targetDailyStudyHrs, 6.0) || 6.0;

  // Weighted Average Daily Velocity (emphasizes recent pace so changes reflect immediately)
  let effectiveAvgDailyHours = defaultTargetPace;
  if (totalEffectiveStudyHours > 0) {
    if (safeLogs.length > 0) {
      effectiveAvgDailyHours = (recentAvgDailyHours * 0.65) + (overallAvgDailyHours * 0.35);
    } else {
      effectiveAvgDailyHours = Math.max(1.0, overallAvgDailyHours);
    }
  }

  // Ensure minimum pace safeguard of 0.5 hours/day
  effectiveAvgDailyHours = Math.max(0.5, effectiveAvgDailyHours);

  // Dynamic Remaining Days = Remaining Topic Hours (Remaining Topics * 2.5 hrs) / Average Daily Study Hours
  let rawRemainingDays = Math.ceil(remainingTopicWorkloadHours / effectiveAvgDailyHours);
  if (remainingTopicsCount === 0) {
    rawRemainingDays = 0;
  } else if (isNaN(rawRemainingDays) || rawRemainingDays < 1) {
    rawRemainingDays = 1;
  }

  const remainingDays = Math.min(999, rawRemainingDays);

  const targetDateObj = new Date(serverTimeIso ? new Date(serverTimeIso) : new Date());
  targetDateObj.setDate(targetDateObj.getDate() + remainingDays);

  const estimatedFinishDate = remainingTopicsCount === 0 
    ? 'TARGET ACHIEVED 🎉' 
    : targetDateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

  const overallProgressPct = Math.min(100, (completedWork / Math.max(1, totalWorkload)) * 100);

  // 5. XP & Rank System (Earned from Topics Completed + Daily Effort Hours Logged)
  const topicXP = completedTopicsCount * 25; // 25 XP per completed topic
  const effortXP = Math.round(totalLoggedHoursAllTime * 10); // 10 XP per logged study hour
  const netXP = topicXP + effortXP;

  const xpPerLevel = 250;
  const rankLevel = Math.floor(netXP / xpPerLevel) + 1;
  const rankXpPct = Math.min(100, ((netXP % xpPerLevel) / xpPerLevel) * 100);

  let rankTitle = 'LBSNAA TRAINEE';
  if (rankLevel >= 30) rankTitle = 'CABINET SECRETARY';
  else if (rankLevel >= 20) rankTitle = 'JOINT SECRETARY';
  else if (rankLevel >= 10) rankTitle = 'DISTRICT COLLECTOR';
  else if (rankLevel >= 5) rankTitle = 'SUB-DIVISIONAL MAGISTRATE';

  const todayWorkScore = Math.round(todayLoggedHours * 10);

  const weightedProd = Number(effectiveAvgDailyHours.toFixed(1));
  const isRecoveryMode = missedDays > 2 || (safeLogs.length > 2 && recentAvgDailyHours < overallAvgDailyHours);
  const paceBottleneck = isRecoveryMode ? 'Daily Pace Dropped' : 'Optimal Pace';

  const safeRemDays = Math.max(1, remainingDays);
  const requiredDailyWorkScore = Math.round(remainingWork / safeRemDays);
  const requiredDailyLectures = Math.max(0, safeNum(c.targetLectures) - actLec) / safeRemDays;
  const requiredDailyBookHrs = Math.max(0, safeNum(c.targetBookHrs) - actBook) / safeRemDays;
  const requiredDailyRevHrs = Math.max(0, safeNum(c.targetRevHrs) - actRev) / safeRemDays;
  const requiredDailyTotalHours = Math.max(1, remainingWork / safeRemDays);

  return {
    totalWorkload,
    completedWork,
    remainingWork,
    weightedProductivity: weightedProd,
    remainingDays,
    estimatedFinishDate,
    overallProgressPct,
    isRecoveryMode,
    paceBottleneck,
    requiredDailyWorkScore,
    requiredDailyLectures,
    requiredDailyBookHrs,
    requiredDailyRevHrs,
    requiredDailyTotalHours,
    todayWorkScore,
    currentStreak: safeNum(safeState.streakCount),
    longestStreak: safeNum(safeState.longestStreak),
    missedDays,
    activeDays,
    rankTitle,
    rankLevel,
    rankXpPct,
    completedTopicsCount,
    totalTopicsCount,
    topicProgressPct,
    activeLectures: actLec,
    activeVideoHrs: actVid,
    activeBookHrs: actBook,
    activeRevHrs: actRev,
    activeAWHrs: actAw,
    activeCAHrs: actCa,
    activeMockHrs: actMock
  };
}

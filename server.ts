import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_STATE } from './src/data/initialData';
import { DEFAULT_SYLLABUS } from './src/data/defaultSyllabus';
import { AppStateData, DailyLog } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory data store for server-side persistence (simulating spreadsheet/DB)
let inMemoryState: AppStateData = { ...INITIAL_STATE };
let inMemorySyllabus = DEFAULT_SYLLABUS;
let inMemoryLogs: DailyLog[] = [
  { date: '2026-07-26', topics: 3, lectures: 2, videoHrs: 5.0, bookHrs: 4.0, revHrs: 1.5, awHrs: 1.0, caHrs: 1.0, mockHrs: 0, workScore: 12.1, xp: 120, streak: 1 },
  { date: '2026-07-27', topics: 2, lectures: 2, videoHrs: 4.5, bookHrs: 3.5, revHrs: 2.0, awHrs: 1.5, caHrs: 1.0, mockHrs: 0, workScore: 12.0, xp: 120, streak: 2 },
  { date: '2026-07-28', topics: 4, lectures: 3, videoHrs: 6.0, bookHrs: 3.0, revHrs: 1.0, awHrs: 1.0, caHrs: 1.5, mockHrs: 0, workScore: 12.35, xp: 124, streak: 3 },
  { date: '2026-07-29', topics: 2, lectures: 1, videoHrs: 3.0, bookHrs: 5.0, revHrs: 2.5, awHrs: 2.0, caHrs: 1.0, mockHrs: 0, workScore: 13.7, xp: 137, streak: 4 },
  { date: '2026-07-30', topics: 3, lectures: 2, videoHrs: 5.0, bookHrs: 4.0, revHrs: 2.0, awHrs: 1.5, caHrs: 1.0, mockHrs: 0, workScore: 13.6, xp: 136, streak: 5 },
  { date: '2026-07-31', topics: 1, lectures: 1, videoHrs: 2.5, bookHrs: 3.0, revHrs: 1.0, awHrs: 0.5, caHrs: 1.0, mockHrs: 0, workScore: 7.7, xp: 77, streak: 6 },
  { date: '2026-08-01', topics: 2, lectures: 2, videoHrs: 5.0, bookHrs: 3.5, revHrs: 1.5, awHrs: 1.0, caHrs: 1.0, mockHrs: 0, workScore: 11.9, xp: 119, streak: 7 }
];

// 1. Health API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '6.0.0', time: new Date().toISOString() });
});

// 2. Load Application State API
app.get('/api/state', (req, res) => {
  res.json({
    state: inMemoryState,
    syllabus: inMemorySyllabus,
    logs: inMemoryLogs,
    serverTime: new Date().toISOString(),
    timezone: 'Asia/Kolkata'
  });
});

// 3. Save Application State API
app.post('/api/state', (req, res) => {
  try {
    const { state, syllabus } = req.body;
    if (!state) {
      return res.status(400).json({ success: false, error: 'State payload required' });
    }

    inMemoryState = { ...inMemoryState, ...state };
    if (syllabus && typeof syllabus === 'object' && Object.keys(syllabus).length > 0) {
      inMemorySyllabus = syllabus;
    }

    // Record or update daily log entry for today
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const d = inMemoryState.daily || { lectures: 0, videoHrs: 0, bookHrs: 0, revHrs: 0, awHrs: 0, caHrs: 0, mockHrs: 0 };

    const safeNum = (v: unknown) => {
      const n = Number(v);
      return isNaN(n) || !isFinite(n) ? 0 : n;
    };

    const dailyWorkScore =
      (safeNum(d.videoHrs) * 1.0) +
      (safeNum(d.bookHrs) * 0.8) +
      (safeNum(d.revHrs) * 1.2) +
      (safeNum(d.awHrs) * 1.4) +
      (safeNum(d.caHrs) * 0.9) +
      (safeNum(d.mockHrs) * 1.5);

    const logEntry: DailyLog = {
      date: todayStr,
      topics: (inMemoryState.completedTopics || []).length,
      lectures: safeNum(d.lectures),
      videoHrs: safeNum(d.videoHrs),
      bookHrs: safeNum(d.bookHrs),
      revHrs: safeNum(d.revHrs),
      awHrs: safeNum(d.awHrs),
      caHrs: safeNum(d.caHrs),
      mockHrs: safeNum(d.mockHrs),
      workScore: Number(dailyWorkScore.toFixed(2)),
      xp: safeNum(inMemoryState.netXP),
      streak: safeNum(inMemoryState.streakCount)
    };

    const existingIndex = inMemoryLogs.findIndex((l) => l.date === todayStr);
    if (existingIndex >= 0) {
      inMemoryLogs[existingIndex] = logEntry;
    } else {
      inMemoryLogs.push(logEntry);
    }

    return res.json({ success: true, timestamp: now.toISOString() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to save state' });
  }
});

// 4. Gemini AI Study Coach API
app.post('/api/ai-coach', async (req, res) => {
  try {
    const { userPrompt, summaryMetrics, completedTopics, weakTopics } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY environment variable is not configured.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `You are the UPSC Master OS AI Strategic Coach, an expert Indian Civil Services Examination (CSE) mentor with deep knowledge of Prelims, Mains (GS1, GS2, GS3, GS4, Essay, Optional), CSAT, and Interview preparation.
    
    Your role is to analyze the student's study metrics, remaining workload, velocity, and topic completion status, and provide concise, highly motivating, tactical advice.

    Guidelines:
    1. Structure your advice clearly using Markdown with headers and bullet points.
    2. Focus on practical exam strategy: PYQ high-yield topics, Answer Writing daily discipline, Revision cycles (1-7-30 day method), and mock test mistake analysis.
    3. Keep tone authoritative, inspiring, and laser-focused on clearing UPSC Civil Services.
    `;

    const prompt = `Current Student Analytics Snapshot:
    - Estimated Finish Date: ${summaryMetrics?.estimatedFinishDate || 'N/A'} (${summaryMetrics?.remainingDays || 0} days remaining)
    - Overall Progress: ${summaryMetrics?.overallProgressPct?.toFixed(1) || 0}%
    - Civil Service Rank: ${summaryMetrics?.rankTitle || 'LBSNAA TRAINEE'} (Level ${summaryMetrics?.rankLevel || 1})
    - Current Streak: ${summaryMetrics?.currentStreak || 0} days
    - Recovery Mode: ${summaryMetrics?.isRecoveryMode ? 'ACTIVE (Velocity dropped recently)' : 'OFF (Healthy velocity)'}
    - Required Daily Work Score Target: ${summaryMetrics?.requiredDailyWorkScore?.toFixed(1) || 0} (Req. Books: ${summaryMetrics?.requiredDailyBookHrs?.toFixed(1) || 0}h, Rev: ${summaryMetrics?.requiredDailyRevHrs?.toFixed(1) || 0}h, Lec: ${summaryMetrics?.requiredDailyLectures?.toFixed(1) || 0})
    - Completed Topics Count: ${summaryMetrics?.completedTopicsCount || 0} / ${summaryMetrics?.totalTopicsCount || 0}
    - Flagged Weak Topics Count: ${weakTopics?.length || 0}

    Student's Query or Request: "${userPrompt || 'Give me a strategic 7-day action plan based on my current pace and weaknesses.'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    return res.json({ text: response.text });
  } catch (err: any) {
    console.error('AI Coach error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate AI strategy.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 UPSC Master OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

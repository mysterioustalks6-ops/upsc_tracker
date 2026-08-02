import { AppStateData, DailyLog, MockTest, AnalyticsSummary } from '../types';

export interface SpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Creates a dedicated UPSC Master OS Tracker spreadsheet in user's Google Drive
 */
export async function createUPSCSpreadsheet(
  accessToken: string,
  title = `UPSC Master OS Tracker - ${new Date().toLocaleDateString('en-GB')}`
): Promise<SpreadsheetInfo> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Summary & Metrics' } },
        { properties: { title: 'Daily Logs' } },
        { properties: { title: 'Mock Tests' } },
        { properties: { title: 'Completed Topics' } },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (errorText.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') || errorText.includes('insufficient authentication scopes') || response.status === 403) {
      throw new Error('Google Sheets API scope missing. Please click "Sign Out" and sign in again with Google to grant Google Sheets access, or use Tab 1 (Link) / Tab 2 (Paste) / Tab 3 (CSV) to import without login!');
    }
    throw new Error(`Failed to create spreadsheet: ${errorText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
    title: data.properties.title,
  };
}

/**
 * Export full App State & Daily Logs to Google Sheet
 */
export async function syncDataToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  state: AppStateData,
  logs: DailyLog[],
  analytics: AnalyticsSummary
): Promise<boolean> {
  // 1. Prepare Summary Sheet Data
  const summaryValues = [
    ['UPSC MASTER OS - LIVE ANALYTICS SUMMARY'],
    ['Export Date', new Date().toLocaleString()],
    [''],
    ['Metric', 'Value'],
    ['Overall Progress %', `${analytics.overallProgressPct.toFixed(2)}%`],
    ['Predicted Finish Date', analytics.estimatedFinishDate],
    ['Days Remaining', analytics.remainingDays],
    ['Total Workload', analytics.totalWorkload.toFixed(1)],
    ['Completed Work', analytics.completedWork.toFixed(1)],
    ['Remaining Work', analytics.remainingWork.toFixed(1)],
    ['Weighted Productivity', analytics.weightedProductivity.toFixed(1)],
    ['Civil Service Rank', analytics.rankTitle],
    ['Rank Level', analytics.rankLevel],
    ['Total Net XP', state.netXP],
    ['Current Streak', analytics.currentStreak],
    ['Longest Streak', analytics.longestStreak],
    ['Active Days', analytics.activeDays],
    ['Missed Days', analytics.missedDays],
    ['Today Work Score', analytics.todayWorkScore.toFixed(1)],
    ['Total Completed Topics', analytics.completedTopicsCount],
  ];

  // 2. Prepare Daily Logs Data
  const dailyLogValues = [
    ['Date', 'Work Score', 'Lectures', 'Video Hrs', 'Book Hrs', 'Rev Hrs', 'Ans Wrt Hrs', 'Curr Aff Hrs', 'Mock Hrs', 'XP', 'Streak'],
    ...logs.map((l) => [
      l.date,
      l.workScore,
      l.lectures,
      l.videoHrs,
      l.bookHrs,
      l.revHrs,
      l.awHrs,
      l.caHrs,
      l.mockHrs,
      l.xp,
      l.streak,
    ]),
  ];

  // 3. Prepare Mock Tests Data
  const mockTestValues = [
    ['Test ID', 'Test Name', 'Subject', 'Score', 'Max Score', 'Percentage', 'Date', 'Notes'],
    ...state.mockTests.map((t) => [
      t.id,
      t.name,
      t.subject || 'GS',
      t.score,
      t.maxScore || 200,
      `${(((t.score / (t.maxScore || 200)) * 100)).toFixed(1)}%`,
      t.date,
      t.notes || '',
    ]),
  ];

  // 4. Prepare Completed Topics Data
  const topicValues = [
    ['Topic ID / Code'],
    ...state.completedTopics.map((id) => [id]),
  ];

  // Execute Batch Update to Spreadsheet
  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const batchBody = {
    valueInputOption: 'USER_ENTERED',
    data: [
      { range: "'Summary & Metrics'!A1", values: summaryValues },
      { range: "'Daily Logs'!A1:K" + (dailyLogValues.length + 5), values: dailyLogValues },
      { range: "'Mock Tests'!A1:H" + (mockTestValues.length + 5), values: mockTestValues },
      { range: "'Completed Topics'!A1:A" + (topicValues.length + 5), values: topicValues },
    ],
  };

  const batchRes = await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(batchBody),
  });

  if (!batchRes.ok) {
    const err = await batchRes.text();
    if (err.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') || err.includes('insufficient authentication scopes') || batchRes.status === 403) {
      throw new Error('Google Sheets API scope missing. Please Sign Out and sign in again to grant Google Sheets permission.');
    }
    throw new Error(`Google Sheets sync failed: ${err}`);
  }

  return true;
}

/**
 * Fetch and Import Daily Logs, Mock Tests, Completed Topics & Syllabus from Google Sheet
 */
export async function fetchSpreadsheetData(accessToken: string, spreadsheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges='Daily Logs'!A2:K1000&ranges='Mock Tests'!A2:H1000&ranges='Completed Topics'!A2:A2000&ranges='Syllabus'!A2:C1000`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    if (errText.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') || errText.includes('insufficient authentication scopes') || res.status === 403) {
      throw new Error('Google Sheets API scope missing. Please Sign Out and sign in again to grant Google Sheets permission.');
    }
    throw new Error(`Failed to read spreadsheet data: ${errText}`);
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  const dailyLogRows = valueRanges[0]?.values || [];
  const mockTestRows = valueRanges[1]?.values || [];
  const completedTopicRows = valueRanges[2]?.values || [];
  const syllabusRows = valueRanges[3]?.values || [];

  // Parse Daily Logs
  const importedLogs: DailyLog[] = dailyLogRows.map((row: any[]) => ({
    date: row[0] || new Date().toISOString().split('T')[0],
    topics: 0,
    workScore: Number(row[1]) || 0,
    lectures: Number(row[2]) || 0,
    videoHrs: Number(row[3]) || 0,
    bookHrs: Number(row[4]) || 0,
    revHrs: Number(row[5]) || 0,
    awHrs: Number(row[6]) || 0,
    caHrs: Number(row[7]) || 0,
    mockHrs: Number(row[8]) || 0,
    xp: Number(row[9]) || 0,
    streak: Number(row[10]) || 0,
  }));

  // Parse Mock Tests
  const importedMocks: MockTest[] = mockTestRows.map((row: any[], i: number) => ({
    id: row[0] || `mock_${Date.now()}_${i}`,
    name: row[1] || 'Imported Mock Test',
    subject: row[2] || 'GS',
    score: Number(row[3]) || 0,
    maxScore: Number(row[4]) || 200,
    date: row[6] || new Date().toISOString().split('T')[0],
    notes: row[7] || '',
  }));

  // Parse Completed Topics
  const importedTopics: string[] = completedTopicRows
    .map((row: any[]) => row[0])
    .filter(Boolean);

  // Parse Custom Syllabus if present (Subject, Topic, Subtopic, Theme, Priority)
  let importedSyllabus: Record<string, { id: string; title: string; pyq: string }[]> | undefined = undefined;
  if (syllabusRows.length > 0) {
    importedSyllabus = {};
    syllabusRows.forEach((row: any[], idx: number) => {
      const subject = (row[0] || 'General Studies').trim();
      const topic = (row[1] || '').trim();
      const subtopic = (row[2] || '').trim();
      const theme = (row[3] || '').trim();
      const rawPyq = (row[4] || row[2] || 'Normal').trim();

      if (subject && (topic || subtopic)) {
        let fullTitle = topic || subtopic;
        if (topic && subtopic && subtopic !== topic) {
          fullTitle += ` › ${subtopic}`;
        }
        if (theme && theme !== subtopic && theme !== topic) {
          fullTitle += ` [Theme: ${theme}]`;
        }

        let pyq = 'Normal';
        const rawLower = rawPyq.toLowerCase();
        if (rawLower.includes('high') || rawLower.includes('vvh') || rawLower.includes('important')) pyq = 'High';
        else if (rawLower.includes('med')) pyq = 'Medium';

        if (!importedSyllabus![subject]) {
          importedSyllabus![subject] = [];
        }
        importedSyllabus![subject].push({
          id: `custom_topic_${idx}_${Date.now()}`,
          title: fullTitle,
          pyq,
        });
      }
    });
  }

  return { importedLogs, importedMocks, importedTopics, importedSyllabus };
}

/**
 * Fetch a Public Google Sheet directly as CSV without requiring OAuth login
 */
export async function fetchPublicGoogleSheetCSV(sheetUrlOrId: string) {
  const cleanInput = sheetUrlOrId.trim();

  // If user pasted a direct published CSV URL (pub?output=csv)
  if (cleanInput.includes('output=csv') || cleanInput.endsWith('.csv')) {
    const res = await fetch(cleanInput);
    if (res.ok) {
      const text = await res.text();
      if (text && !text.includes('<!DOCTYPE html>')) {
        return parsePastedSyllabusText(text);
      }
    }
  }

  // Extract spreadsheet ID from URL
  let sheetId = cleanInput;
  if (sheetId.includes('/d/')) {
    sheetId = sheetId.split('/d/')[1].split('/')[0];
  }

  if (!sheetId) {
    throw new Error('Kripya ek valid Google Sheet URL ya Sheet ID dalein.');
  }

  // Endpoint 1: GViz CSV Export
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  try {
    const res = await fetch(gvizUrl);
    if (res.ok) {
      const csvText = await res.text();
      if (csvText && !csvText.includes('<!DOCTYPE html>') && !csvText.includes('google.visualization.Query')) {
        return parsePastedSyllabusText(csvText);
      }
    }
  } catch (err) {
    console.warn('gviz endpoint failed, trying pub endpoint...', err);
  }

  // Endpoint 2: Export CSV pub
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  try {
    const res = await fetch(exportUrl);
    if (res.ok) {
      const csvText = await res.text();
      if (csvText && !csvText.includes('<!DOCTYPE html>')) {
        return parsePastedSyllabusText(csvText);
      }
    }
  } catch (err) {
    console.warn('export endpoint failed...', err);
  }

  throw new Error(
    'Google Sheet access nahi mila. Kripya Google Sheet ke top-right me "Share" button par click karke access ko "Anyone with the link can view" par set karein, aur phir try karein!'
  );
}

/**
 * Parses pasted cells from Google Sheets (TSV, CSV, or Pipe separated text)
 */
export function parsePastedSyllabusText(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    throw new Error('No data found in pasted text or Google Sheet.');
  }

  const importedSyllabus: Record<string, { id: string; title: string; pyq: string }[]> = {};
  let totalCount = 0;

  // Split lines into parts
  const parsedRows: string[][] = lines.map((line) => {
    let parts: string[] = [];
    if (line.includes('\t')) {
      parts = line.split('\t');
    } else if (line.includes('|')) {
      parts = line.split('|');
    } else if (line.includes(',')) {
      parts = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
    } else {
      parts = [line];
    }
    return parts.map((p) => p.replace(/^["']|["']$/g, '').trim());
  });

  // Detect header indices
  let subjectIdx = -1;
  let topicIdx = -1;
  let subtopicIdx = -1;
  let themeIdx = -1;
  let pyqIdx = -1;

  const firstRow = parsedRows[0];
  const isHeaderRow = firstRow.some((col) => {
    const c = col.toLowerCase();
    return c.includes('subject') || c.includes('topic') || c.includes('subtopic') || c.includes('theme') || c.includes('pyq') || c.includes('priority') || c.includes('paper');
  });

  let startRowIdx = 0;
  if (isHeaderRow) {
    startRowIdx = 1;
    firstRow.forEach((col, i) => {
      const c = col.toLowerCase();
      if (c.includes('subject') || c.includes('paper') || c.includes('discipline')) subjectIdx = i;
      else if (c.includes('subtopic') || c.includes('sub-topic') || c.includes('micro')) subtopicIdx = i;
      else if (c.includes('topic') || c.includes('chapter') || c.includes('heading')) topicIdx = i;
      else if (c.includes('theme') || c.includes('unit') || c.includes('area')) themeIdx = i;
      else if (c.includes('pyq') || c.includes('priority') || c.includes('importance') || c.includes('frequency')) pyqIdx = i;
    });
  }

  for (let idx = startRowIdx; idx < parsedRows.length; idx++) {
    const parts = parsedRows[idx];
    if (parts.length === 0 || (parts.length === 1 && !parts[0])) continue;

    let subject = 'General Studies';
    let topic = '';
    let subtopic = '';
    let theme = '';
    let pyq = 'Normal';

    if (subjectIdx >= 0 && parts[subjectIdx]) subject = parts[subjectIdx];
    if (topicIdx >= 0 && parts[topicIdx]) topic = parts[topicIdx];
    if (subtopicIdx >= 0 && parts[subtopicIdx]) subtopic = parts[subtopicIdx];
    if (themeIdx >= 0 && parts[themeIdx]) theme = parts[themeIdx];
    if (pyqIdx >= 0 && parts[pyqIdx]) {
      const raw = parts[pyqIdx].toLowerCase();
      if (raw.includes('high') || raw.includes('vvh') || raw.includes('important')) pyq = 'High';
      else if (raw.includes('med')) pyq = 'Medium';
    }

    // Positional fallback if header search didn't match all fields
    if (!topic && !subtopic) {
      if (parts.length >= 5) {
        // Col 0: Subject, Col 1: Topic, Col 2: Subtopic, Col 3: Theme, Col 4: Priority
        subject = parts[0] || 'General Studies';
        topic = parts[1] || '';
        subtopic = parts[2] || '';
        theme = parts[3] || '';
        const rawP = (parts[4] || '').toLowerCase();
        if (rawP.includes('high') || rawP.includes('important')) pyq = 'High';
        else if (rawP.includes('med')) pyq = 'Medium';
      } else if (parts.length === 4) {
        // Col 0: Subject, Col 1: Topic, Col 2: Subtopic/Theme, Col 3: Priority
        subject = parts[0] || 'General Studies';
        topic = parts[1] || '';
        subtopic = parts[2] || '';
        const rawP = (parts[3] || '').toLowerCase();
        if (rawP.includes('high')) pyq = 'High';
        else if (rawP.includes('med')) pyq = 'Medium';
      } else if (parts.length === 3) {
        // Col 0: Subject, Col 1: Topic, Col 2: Priority/Subtopic
        subject = parts[0] || 'General Studies';
        topic = parts[1] || '';
        const col2Lower = (parts[2] || '').toLowerCase();
        if (col2Lower.includes('high') || col2Lower.includes('med') || col2Lower.includes('norm')) {
          if (col2Lower.includes('high')) pyq = 'High';
          else if (col2Lower.includes('med')) pyq = 'Medium';
        } else {
          subtopic = parts[2] || '';
        }
      } else if (parts.length === 2) {
        subject = parts[0] || 'General Studies';
        topic = parts[1] || '';
      } else if (parts.length === 1 && parts[0]) {
        topic = parts[0];
      }
    }

    if (!topic && subtopic) {
      topic = subtopic;
      subtopic = '';
    }

    if (topic) {
      let fullTitle = topic;
      if (subtopic && subtopic !== topic) {
        fullTitle += ` › ${subtopic}`;
      }
      if (theme && theme !== subtopic && theme !== topic) {
        fullTitle += ` [Theme: ${theme}]`;
      }

      if (!importedSyllabus[subject]) {
        importedSyllabus[subject] = [];
      }

      importedSyllabus[subject].push({
        id: `custom_topic_${idx}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: fullTitle,
        pyq,
      });
      totalCount++;
    }
  }

  if (totalCount === 0) {
    throw new Error('No valid syllabus topics found in text or Google Sheet.');
  }

  return { importedSyllabus, totalCount };
}

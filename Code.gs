/**
 * ============================================================================
 * UPSC MASTER OS v6.0 - GOOGLE APPS SCRIPT BACKEND
 * ============================================================================
 * Web App Entry Point, Data Persistence, and Gemini AI Strategy Coach Integration
 */

// 1. WEB APP ENTRY POINT
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template
    .evaluate()
    .setTitle('UPSC Master OS v6.0 - Cyber Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Helper to inline external HTML files (Style.html, Script.html)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 2. DEFAULT DATA CONFIGURATIONS
var DEFAULT_CONFIG = {
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

var INITIAL_STATE = {
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

var DEFAULT_SYLLABUS = {
  'GS1 - History & Art Culture': [
    { id: 'gs1_hist_01', title: 'Ancient India: Indus Valley Civilisation & Vedic Period', pyq: 'High' },
    { id: 'gs1_hist_02', title: 'Buddhism, Jainism, Ajivikas & Philosophy Schools', pyq: 'High' },
    { id: 'gs1_hist_03', title: 'Mauryan & Post-Mauryan Empire (Art, Rock Edicts, Ashoka)', pyq: 'High' },
    { id: 'gs1_hist_04', title: 'Gupta Age & Harshavardhana: Temple Architecture & Science', pyq: 'Medium' },
    { id: 'gs1_hist_05', title: 'Sultanate & Vijayanagara Empire (Administration & Architecture)', pyq: 'High' },
    { id: 'gs1_hist_06', title: 'Mughal Empire, Marathas & Regional States', pyq: 'Medium' },
    { id: 'gs1_hist_07', title: 'Bhakti & Sufi Movements: Literature and Saints', pyq: 'High' },
    { id: 'gs1_hist_08', title: 'Modern India: British Expansion, Carnatic & Anglo-Maratha Wars', pyq: 'Normal' },
    { id: 'gs1_hist_09', title: 'Socio-Religious Reform Movements (Raja Ram Mohan, Phule, Vivekananda)', pyq: 'High' },
    { id: 'gs1_hist_10', title: 'Revolt of 1857: Causes, Leaders, Impact & Civil Uprisings', pyq: 'High' },
    { id: 'gs1_hist_11', title: 'INC Formation, Moderate vs Extremist Phase (1885-1915)', pyq: 'High' },
    { id: 'gs1_hist_12', title: 'Gandhian Era: Non-Cooperation, Khilafat & Civil Disobedience', pyq: 'High' },
    { id: 'gs1_hist_13', title: 'Quit India Movement, INA, Subhash Chandra Bose & Cabinet Mission', pyq: 'High' },
    { id: 'gs1_hist_14', title: 'Post-Independence Integration of Princely States & States Reorganisation', pyq: 'Medium' },
    { id: 'gs1_hist_15', title: 'World History: Industrial Revolution, World Wars & Cold War', pyq: 'Normal' }
  ],
  'GS1 - Geography & Society': [
    { id: 'gs1_geo_01', title: 'Geomorphology: Plate Tectonics, Earthquakes & Volcanism', pyq: 'High' },
    { id: 'gs1_geo_02', title: 'Climatology: Atmospheric Circulation, Monsoons, El Nino/La Nina', pyq: 'High' },
    { id: 'gs1_geo_03', title: 'Oceanography: Ocean Currents, Tides, Coral Reefs & Salinity', pyq: 'High' },
    { id: 'gs1_geo_04', title: 'Indian Physical Geography: River Systems, Himalayas & Peninsular Plateau', pyq: 'High' },
    { id: 'gs1_geo_05', title: 'Resource Distribution: Minerals, Water Resources & Energy Crises', pyq: 'Medium' },
    { id: 'gs1_geo_06', title: 'Location of Industries & Factors of Industrial Location', pyq: 'Medium' },
    { id: 'gs1_geo_07', title: 'Indian Society: Diversity, Salient Features & Women Issues', pyq: 'High' },
    { id: 'gs1_geo_08', title: 'Population, Urbanisation, Slums & Migration Issues', pyq: 'High' },
    { id: 'gs1_geo_09', title: 'Communalism, Regionalism, Secularism & Social Empowerment', pyq: 'High' }
  ],
  'GS2 - Polity & Constitution': [
    { id: 'gs2_pol_01', title: 'Historical Underpinnings & Making of Indian Constitution', pyq: 'Medium' },
    { id: 'gs2_pol_02', title: 'Preamble, Fundamental Rights, DPSP & Fundamental Duties', pyq: 'High' },
    { id: 'gs2_pol_03', title: 'Basic Structure Doctrine & Landmark Supreme Court Judgements', pyq: 'High' },
    { id: 'gs2_pol_04', title: 'Federal System, Center-State Relations & Interstate Disputes', pyq: 'High' },
    { id: 'gs2_pol_05', title: 'Parliament & State Legislatures: Structure, Working & Privileges', pyq: 'High' },
    { id: 'gs2_pol_06', title: 'Executive: President, Prime Minister, Governor & Cabinet Committees', pyq: 'High' },
    { id: 'gs2_pol_07', title: 'Judiciary: Supreme Court, High Courts, Judicial Review & PIL', pyq: 'High' },
    { id: 'gs2_pol_08', title: 'Panchayati Raj & Urban Local Bodies (73rd & 74th Amendment)', pyq: 'High' },
    { id: 'gs2_pol_09', title: 'Constitutional Bodies: ECI, UPSC, CAG, Finance Commission, NCSC/NCST', pyq: 'High' },
    { id: 'gs2_pol_10', title: 'Non-Constitutional Bodies: NITI Aayog, NHRC, CIC, CVC, CBI', pyq: 'Medium' },
    { id: 'gs2_pol_11', title: 'Representation of People Act (RPA 1951) & Electoral Reforms', pyq: 'High' }
  ],
  'GS2 - Governance & IR': [
    { id: 'gs2_gov_01', title: 'E-Governance: Applications, Models, Successes & RTI Act', pyq: 'High' },
    { id: 'gs2_gov_02', title: 'Role of Civil Services in Democracy & Citizen Charters', pyq: 'Medium' },
    { id: 'gs2_gov_03', title: 'Welfare Schemes for Vulnerable Sections & NGO/SHG Role', pyq: 'High' },
    { id: 'gs2_gov_04', title: 'Issues relating to Health, Education & Human Resources', pyq: 'High' },
    { id: 'gs2_gov_05', title: 'India and its Neighbourhood Relations (South Asia)', pyq: 'High' },
    { id: 'gs2_gov_06', title: 'Bilateral & Global Groupings (QUAD, BRICS, G2O, SCO, I2U2)', pyq: 'High' },
    { id: 'gs2_gov_07', title: 'International Organisations (UN Reforms, WTO, IMF, World Bank)', pyq: 'High' }
  ],
  'GS3 - Economy & Agriculture': [
    { id: 'gs3_eco_01', title: 'Indian Economy & Planning, Growth, Development & Employment', pyq: 'High' },
    { id: 'gs3_eco_02', title: 'Government Budgeting, Fiscal Policy & Taxation Reforms (GST)', pyq: 'High' },
    { id: 'gs3_eco_03', title: 'Monetary Policy, RBI, Inflation & Banking Sector NPA Reforms', pyq: 'High' },
    { id: 'gs3_eco_04', title: 'Capital Market, Stock Exchanges & Financial Sector Inclusion', pyq: 'Medium' },
    { id: 'gs3_eco_05', title: 'Infrastructure: Energy, Ports, Roads, Airports, Railways', pyq: 'High' },
    { id: 'gs3_eco_06', title: 'Major Crops, Cropping Patterns, Irrigation Systems & E-Technology', pyq: 'High' },
    { id: 'gs3_eco_07', title: 'MSP, Direct/Indirect Subsidies & Public Distribution System (PDS)', pyq: 'High' },
    { id: 'gs3_eco_08', title: 'Food Processing & Related Industries in India', pyq: 'High' },
    { id: 'gs3_eco_09', title: 'Land Reforms in India & Agriculture Supply Chain', pyq: 'Medium' }
  ],
  'GS3 - Sci-Tech, Env & Security': [
    { id: 'gs3_sci_01', title: 'Science & Tech Achievements of Indians, Indigenisation & Tech Transfer', pyq: 'Medium' },
    { id: 'gs3_sci_02', title: 'IT, Space (ISRO Missions), Computers, Robotics, Nanotechnology', pyq: 'High' },
    { id: 'gs3_sci_03', title: 'Biotechnology & Intellectual Property Rights (IPR) Issues', pyq: 'High' },
    { id: 'gs3_env_01', title: 'Conservation, Environmental Pollution & Degradation (COP/UNFCCC)', pyq: 'High' },
    { id: 'gs3_env_02', title: 'Environmental Impact Assessment (EIA) & Wildlife Acts', pyq: 'High' },
    { id: 'gs3_env_03', title: 'Disaster Management: NDMA Guidelines, Floods, Cyclones & Landslides', pyq: 'High' },
    { id: 'gs3_sec_01', title: 'Linkages between Development and Extremism (Left Wing Extremism)', pyq: 'High' },
    { id: 'gs3_sec_02', title: 'Cybersecurity, Basics of Cyber Warfare & Social Media Challenges', pyq: 'High' },
    { id: 'gs3_sec_03', title: 'Money Laundering and its Prevention & Organised Crime Linkages', pyq: 'High' },
    { id: 'gs3_sec_04', title: 'Border Area Security Management & Security Forces Structure', pyq: 'Medium' }
  ],
  'GS4 - Ethics & Aptitude': [
    { id: 'gs4_eth_01', title: 'Ethics and Human Interface: Essence, Determinants & Consequences', pyq: 'High' },
    { id: 'gs4_eth_02', title: 'Human Values: Lessons from Lives of Great Leaders & Reformers', pyq: 'High' },
    { id: 'gs4_eth_03', title: 'Attitude: Content, Structure, Function, Influence & Behavioral Relations', pyq: 'High' },
    { id: 'gs4_eth_04', title: 'Emotional Intelligence: Concepts & Utilities in Administration', pyq: 'High' },
    { id: 'gs4_eth_05', title: 'Contributions of Moral Thinkers & Philosophers (Indian & Western)', pyq: 'High' },
    { id: 'gs4_eth_06', title: 'Public Service Values & Ethics in Public Administration', pyq: 'High' },
    { id: 'gs4_eth_07', title: 'Probity in Governance, Transparency & Information Sharing', pyq: 'High' },
    { id: 'gs4_eth_08', title: 'Case Studies on Ethical Dilemmas in Public Administration', pyq: 'High' }
  ],
  'CSAT & Current Affairs': [
    { id: 'csat_01', title: 'Reading Comprehension Strategies & Practice Modules', pyq: 'High' },
    { id: 'csat_02', title: 'Quantitative Aptitude: Number System, Percentages & Profit/Loss', pyq: 'High' },
    { id: 'csat_03', title: 'Quantitative Aptitude: Time-Work, Speed-Distance & Permutations', pyq: 'High' },
    { id: 'csat_04', title: 'Logical Reasoning, Data Interpretation & Syllogisms', pyq: 'High' },
    { id: 'ca_01', title: 'Monthly Current Affairs Analysis (Polity, Economy & IR)', pyq: 'High' },
    { id: 'ca_02', title: 'Monthly Current Affairs Analysis (Environment, S&T, Reports)', pyq: 'High' },
    { id: 'ca_03', title: 'Economic Survey & Union Budget Analysis', pyq: 'High' },
    { id: 'ca_04', title: 'Yearly Compilations (PT 365 / Mains 365 Modules)', pyq: 'High' }
  ]
};

var DEFAULT_LOGS = [
  { date: '2026-07-26', topics: 3, lectures: 2, videoHrs: 5.0, bookHrs: 4.0, revHrs: 1.5, awHrs: 1.0, caHrs: 1.0, mockHrs: 0, workScore: 12.1, xp: 120, streak: 1 },
  { date: '2026-07-27', topics: 2, lectures: 2, videoHrs: 4.5, bookHrs: 3.5, revHrs: 2.0, awHrs: 1.5, caHrs: 1.0, mockHrs: 0, workScore: 12.0, xp: 120, streak: 2 },
  { date: '2026-07-28', topics: 4, lectures: 3, videoHrs: 6.0, bookHrs: 3.0, revHrs: 1.0, awHrs: 1.0, caHrs: 1.5, mockHrs: 0, workScore: 12.35, xp: 124, streak: 3 },
  { date: '2026-07-29', topics: 2, lectures: 1, videoHrs: 3.0, bookHrs: 5.0, revHrs: 2.5, awHrs: 2.0, caHrs: 1.0, mockHrs: 0, workScore: 13.7, xp: 137, streak: 4 },
  { date: '2026-07-30', topics: 3, lectures: 2, videoHrs: 5.0, bookHrs: 4.0, revHrs: 2.0, awHrs: 1.5, caHrs: 1.0, mockHrs: 0, workScore: 13.6, xp: 136, streak: 5 },
  { date: '2026-07-31', topics: 1, lectures: 1, videoHrs: 2.5, bookHrs: 3.0, revHrs: 1.0, awHrs: 0.5, caHrs: 1.0, mockHrs: 0, workScore: 7.7, xp: 77, streak: 6 },
  { date: '2026-08-01', topics: 2, lectures: 2, videoHrs: 5.0, bookHrs: 3.5, revHrs: 1.5, awHrs: 1.0, caHrs: 1.0, mockHrs: 0, workScore: 11.9, xp: 119, streak: 7 }
];

// 3. GET STATE DATA
function getStateData() {
  try {
    var userProps = PropertiesService.getUserProperties();
    var stateJson = userProps.getProperty('UPSC_STATE_DATA');
    var logsJson = userProps.getProperty('UPSC_LOGS_DATA');

    var state = stateJson ? JSON.parse(stateJson) : INITIAL_STATE;
    var logs = logsJson ? JSON.parse(logsJson) : DEFAULT_LOGS;

    return {
      state: state,
      syllabus: DEFAULT_SYLLABUS,
      logs: logs,
      serverTime: new Date().toISOString()
    };
  } catch (err) {
    return {
      state: INITIAL_STATE,
      syllabus: DEFAULT_SYLLABUS,
      logs: DEFAULT_LOGS,
      serverTime: new Date().toISOString()
    };
  }
}

// 4. SAVE STATE DATA
function saveStateData(statePayload) {
  try {
    var userProps = PropertiesService.getUserProperties();
    userProps.setProperty('UPSC_STATE_DATA', JSON.stringify(statePayload));

    // Automatically record today's daily log entry
    var now = new Date();
    var todayStr = now.toISOString().split('T')[0];
    var logsJson = userProps.getProperty('UPSC_LOGS_DATA');
    var logs = logsJson ? JSON.parse(logsJson) : DEFAULT_LOGS;

    var d = statePayload.daily || {};
    var safeNum = function(v) { return Number(v) || 0; };

    var dailyWorkScore =
      (safeNum(d.videoHrs) * 1.0) +
      (safeNum(d.bookHrs) * 0.8) +
      (safeNum(d.revHrs) * 1.2) +
      (safeNum(d.awHrs) * 1.4) +
      (safeNum(d.caHrs) * 0.9) +
      (safeNum(d.mockHrs) * 1.5);

    var logEntry = {
      date: todayStr,
      topics: (statePayload.completedTopics || []).length,
      lectures: safeNum(d.lectures),
      videoHrs: safeNum(d.videoHrs),
      bookHrs: safeNum(d.bookHrs),
      revHrs: safeNum(d.revHrs),
      awHrs: safeNum(d.awHrs),
      caHrs: safeNum(d.caHrs),
      mockHrs: safeNum(d.mockHrs),
      workScore: Number(dailyWorkScore.toFixed(2)),
      xp: safeNum(statePayload.netXP),
      streak: safeNum(statePayload.streakCount)
    };

    var existingIdx = -1;
    for (var i = 0; i < logs.length; i++) {
      if (logs[i].date === todayStr) {
        existingIdx = i;
        break;
      }
    }

    if (existingIdx >= 0) {
      logs[existingIdx] = logEntry;
    } else {
      logs.push(logEntry);
    }

    userProps.setProperty('UPSC_LOGS_DATA', JSON.stringify(logs));

    return { success: true, timestamp: now.toISOString() };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// 5. GEMINI AI STRATEGY COACH BACKEND API
function getAiCoachResponse(payload) {
  try {
    var scriptProps = PropertiesService.getScriptProperties();
    var apiKey = scriptProps.getProperty('GEMINI_API_KEY');

    if (!apiKey) {
      return { error: 'GEMINI_API_KEY not found in Apps Script Properties. Please set GEMINI_API_KEY under Project Settings > Script Properties.' };
    }

    var userPrompt = payload.userPrompt || 'Give me a strategic 7-day velocity recovery plan.';
    var metrics = payload.summaryMetrics || {};

    var systemInstruction = "You are the UPSC Master OS AI Strategic Coach, an expert Indian Civil Services Examination (CSE) mentor with deep knowledge of Prelims, Mains (GS1, GS2, GS3, GS4, Essay, Optional), CSAT, and Interview preparation.\n\n" +
      "Your role is to analyze the student's study metrics, remaining workload, velocity, and topic completion status, and provide concise, highly motivating, tactical advice.\n\n" +
      "Guidelines:\n" +
      "1. Structure your advice clearly using Markdown headers and bullet points.\n" +
      "2. Focus on practical exam strategy: PYQ high-yield topics, Answer Writing daily discipline, Revision cycles (1-7-30 day method), and mock test mistake analysis.\n" +
      "3. Keep tone authoritative, inspiring, and laser-focused on clearing UPSC Civil Services.";

    var prompt = "Current Student Analytics Snapshot:\n" +
      "- Estimated Finish Date: " + (metrics.estimatedFinishDate || 'N/A') + " (" + (metrics.remainingDays || 0) + " days remaining)\n" +
      "- Overall Progress: " + (metrics.overallProgressPct ? metrics.overallProgressPct.toFixed(1) : '0') + "%\n" +
      "- Civil Service Rank: " + (metrics.rankTitle || 'LBSNAA TRAINEE') + " (Level " + (metrics.rankLevel || 1) + ")\n" +
      "- Current Streak: " + (metrics.currentStreak || 0) + " days\n" +
      "- Recovery Mode: " + (metrics.isRecoveryMode ? 'ACTIVE (Velocity dropped recently)' : 'OFF (Healthy velocity)') + "\n" +
      "- Required Daily Work Score Target: " + (metrics.requiredDailyWorkScore ? metrics.requiredDailyWorkScore.toFixed(1) : '0') + " (Req. Books: " + (metrics.requiredDailyBookHrs ? metrics.requiredDailyBookHrs.toFixed(1) : '0') + "h, Rev: " + (metrics.requiredDailyRevHrs ? metrics.requiredDailyRevHrs.toFixed(1) : '0') + "h, Lec: " + (metrics.requiredDailyLectures ? metrics.requiredDailyLectures.toFixed(1) : '0') + ")\n" +
      "- Completed Topics Count: " + (metrics.completedTopicsCount || 0) + " / " + (metrics.totalTopicsCount || 0) + "\n\n" +
      "Student Query: \"" + userPrompt + "\"";

    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;

    var requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());

    if (json.candidates && json.candidates.length > 0 && json.candidates[0].content && json.candidates[0].content.parts.length > 0) {
      return { text: json.candidates[0].content.parts[0].text };
    } else if (json.error) {
      return { error: json.error.message || 'Gemini API call failed.' };
    } else {
      return { error: 'No content returned from Gemini AI.' };
    }
  } catch (err) {
    return { error: err.toString() };
  }
}

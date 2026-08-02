import { SyllabusData } from '../types';

export const DEFAULT_SYLLABUS: SyllabusData = {
  'GS1 - History & Art Culture': [
    { id: 'gs1_hist_01', title: 'Ancient India: Indus Valley Civilisation & Vedic Period', pyq: 'High', microTopics: ['Harappan Architecture & Town Planning', 'Vedic Literature & Society', 'Religious & Economic Life'] },
    { id: 'gs1_hist_02', title: 'Buddhism, Jainism, Ajivikas & Philosophy Schools', pyq: 'High', microTopics: ['Buddhist Councils & Doctrines', 'Jain Tirthankaras & Philosophy', 'Six Schools of Indian Philosophy'] },
    { id: 'gs1_hist_03', title: 'Mauryan & Post-Mauryan Empire (Art, Rock Edicts, Ashoka)', pyq: 'High', microTopics: ['Ashokan Pillars & Rock Edicts', 'Mauryan Administration', 'Gandhara, Mathura & Amaravati Schools'] },
    { id: 'gs1_hist_04', title: 'Gupta Age & Harshavardhana: Temple Architecture & Science', pyq: 'Medium', microTopics: ['Gupta Golden Age Literature & Science', 'Nagara & Dravida Temple Styles', 'Kannauj Assembly & Harsha reign'] },
    { id: 'gs1_hist_05', title: 'Sultanate & Vijayanagara Empire (Administration & Architecture)', pyq: 'High', microTopics: ['Delhi Sultanate Revenue & Iqta system', 'Vijayanagara Art, Hampi & Foreign Travelers'] },
    { id: 'gs1_hist_06', title: 'Mughal Empire, Marathas & Regional States', pyq: 'Medium', microTopics: ['Mughal Mansabdari & Land Revenue', 'Chhatrapati Shivaji Maharaj & Chauth/Sardeshmukhi'] },
    { id: 'gs1_hist_07', title: 'Bhakti & Sufi Movements: Literature and Saints', pyq: 'High', microTopics: ['Sufi Silsilas & Teachings', 'Bhakti Saints (Kabir, Nanak, Mirabai, Chaitanya)'] },
    { id: 'gs1_hist_08', title: 'Modern India: British Expansion, Carnatic & Anglo-Maratha Wars', pyq: 'Normal', microTopics: ['Battle of Plassey & Buxar', 'Subsidiary Alliance & Doctrine of Lapse'] },
    { id: 'gs1_hist_09', title: 'Socio-Religious Reform Movements (Raja Ram Mohan, Phule, Vivekananda)', pyq: 'High', microTopics: ['Brahmo Samaj & Arya Samaj', 'Satyashodhak Samaj & Caste Movements', 'Women Education & Social Legislation'] },
    { id: 'gs1_hist_10', title: 'Revolt of 1857: Causes, Leaders, Impact & Civil Uprisings', pyq: 'High', microTopics: ['Political & Military Causes of 1857', 'Santhal & Munda Uprisings', 'Queen Victoria Proclamation 1858'] },
    { id: 'gs1_hist_11', title: 'INC Formation, Moderate vs Extremist Phase (1885-1915)', pyq: 'High', microTopics: ['Safety Valve Theory & INC Early Sessions', 'Swadeshi Movement & Partition of Bengal 1905', 'Surat Split 1907 & Morley-Minto Reforms'] },
    { id: 'gs1_hist_12', title: 'Gandhian Era: Non-Cooperation, Khilafat & Civil Disobedience', pyq: 'High', microTopics: ['Champaran, Kheda & Ahmedabad Satyagraha', 'Non-Cooperation & Chauri Chaura', 'Dandi March & Gandhi-Irwin Pact'] },
    { id: 'gs1_hist_13', title: 'Quit India Movement, INA, Subhash Chandra Bose & Cabinet Mission', pyq: 'High', microTopics: ['Quit India August Offer & Underground Leaders', 'INA Trials & Subhash Chandra Bose', 'Cabinet Mission 1946 & Mountbatten Plan'] },
    { id: 'gs1_hist_14', title: 'Post-Independence Integration of Princely States & States Reorganisation', pyq: 'Medium', microTopics: ['Sardar Patel & Accession of Hyderabad/Junagadh', 'Fazl Ali Commission & SRC 1956'] },
    { id: 'gs1_hist_15', title: 'World History: Industrial Revolution, World Wars & Cold War', pyq: 'Normal', microTopics: ['Industrial Revolution in Britain', 'Causes of WWI & Treaty of Versailles', 'Nazism, Fascism & WWII'] }
  ],
  'GS1 - Geography & Society': [
    { id: 'gs1_geo_01', title: 'Geomorphology: Plate Tectonics, Earthquakes & Volcanism', pyq: 'High', microTopics: ['Continental Drift & Plate Tectonics', 'Earthquake Waves & Seismic Zones', 'Volcanic Landforms & Rocks'] },
    { id: 'gs1_geo_02', title: 'Climatology: Atmospheric Circulation, Monsoons, El Nino/La Nina', pyq: 'High', microTopics: ['Pressure Belts & Planetary Winds', 'Indian Monsoon Mechanism & IOD', 'Cyclones & Anticyclones'] },
    { id: 'gs1_geo_03', title: 'Oceanography: Ocean Currents, Tides, Coral Reefs & Salinity', pyq: 'High', microTopics: ['Ocean Relief Features & Bottom Topography', 'Thermohaline Circulation & Currents', 'Coral Bleaching & Conservation'] },
    { id: 'gs1_geo_04', title: 'Indian Physical Geography: River Systems, Himalayas & Peninsular Plateau', pyq: 'High', microTopics: ['Himalayan vs Peninsular River Systems', 'Northern Plains & Coastal Morphology', 'Drainage Patterns & Western Ghats'] },
    { id: 'gs1_geo_05', title: 'Resource Distribution: Minerals, Water Resources & Energy Crises', pyq: 'Medium', microTopics: ['Iron Ore, Bauxite & Coal Belts in India', 'Groundwater Depletion & Rainwater Harvesting'] },
    { id: 'gs1_geo_06', title: 'Location of Industries & Factors of Industrial Location', pyq: 'Medium', microTopics: ['Weber Industrial Location Theory', 'Footloose & High-Tech Industries'] },
    { id: 'gs1_geo_07', title: 'Indian Society: Diversity, Salient Features & Women Issues', pyq: 'High', microTopics: ['Caste System & Kinship in India', 'Gender Parity & Female Labor Force Participation'] },
    { id: 'gs1_geo_08', title: 'Population, Urbanisation, Slums & Migration Issues', pyq: 'High', microTopics: ['Demographic Dividend in India', 'Urban Sprawl & Smart Cities Mission'] },
    { id: 'gs1_geo_09', title: 'Communalism, Regionalism, Secularism & Social Empowerment', pyq: 'High', microTopics: ['Secularism: Indian vs Western Model', 'Regional Aspirations & Inclusivity'] }
  ],
  'GS2 - Polity & Constitution': [
    { id: 'gs2_pol_01', title: 'Historical Underpinnings & Making of Indian Constitution', pyq: 'Medium', microTopics: ['Government of India Acts 1919 & 1935', 'Constituent Assembly Debates'] },
    { id: 'gs2_pol_02', title: 'Preamble, Fundamental Rights, DPSP & Fundamental Duties', pyq: 'High', microTopics: ['Articles 12-35 Fundamental Rights', 'DPSP Enforceability & Socio-Economic Rights', 'Article 51A Fundamental Duties'] },
    { id: 'gs2_pol_03', title: 'Basic Structure Doctrine & Landmark Supreme Court Judgements', pyq: 'High', microTopics: ['Kesavananda Bharati 1973 & Minerva Mills', 'Right to Privacy (Puttaswamy 2017)'] },
    { id: 'gs2_pol_04', title: 'Federal System, Center-State Relations & Interstate Disputes', pyq: 'High', microTopics: ['Legislative, Administrative & Financial Relations', 'Governor Role & Article 356', 'Inter-State Water Disputes Act'] },
    { id: 'gs2_pol_05', title: 'Parliament & State Legislatures: Structure, Working & Privileges', pyq: 'High', microTopics: ['Parliamentary Committees & Law Making', 'Speaker Powers & Anti-Defection Tenth Schedule', 'Budget Process in Parliament'] },
    { id: 'gs2_pol_06', title: 'Executive: President, Prime Minister, Governor & Cabinet Committees', pyq: 'High', microTopics: ['Pardoning Powers of President & Governor', 'Ordinance Making Power Article 123/213'] },
    { id: 'gs2_pol_07', title: 'Judiciary: Supreme Court, High Courts, Judicial Review & PIL', pyq: 'High', microTopics: ['Collegium System & NJAC Debate', 'Contempt of Court & Original/Appellate Jurisdiction'] },
    { id: 'gs2_pol_08', title: 'Panchayati Raj & Urban Local Bodies (73rd & 74th Amendment)', pyq: 'High', microTopics: ['Panchayat Finances & State Finance Commission', 'PESA Act 1996 in Scheduled Areas'] },
    { id: 'gs2_pol_09', title: 'Constitutional Bodies: ECI, UPSC, CAG, Finance Commission, NCSC/NCST', pyq: 'High', microTopics: ['CAG Audit Functions & Reports', 'Election Commission Independence & EVM'] },
    { id: 'gs2_pol_10', title: 'Non-Constitutional Bodies: NITI Aayog, NHRC, CIC, CVC, CBI', pyq: 'Medium', microTopics: ['NITI Aayog Cooperative Federalism', 'CBI Autonomy & General Consent'] },
    { id: 'gs2_pol_11', title: 'Representation of People Act (RPA 1951) & Electoral Reforms', pyq: 'High', microTopics: ['Disqualification of MPs/MLAs', 'Electoral Bonds & Campaign Finance'] }
  ],
  'GS2 - Governance & IR': [
    { id: 'gs2_gov_01', title: 'E-Governance: Applications, Models, Successes & RTI Act', pyq: 'High', microTopics: ['RTI Act Exceptions & Amendments', 'Digital India & Service Delivery'] },
    { id: 'gs2_gov_02', title: 'Role of Civil Services in Democracy & Citizen Charters', pyq: 'Medium', microTopics: ['Lateral Entry into Bureaucracy', 'Mission Karamyogi & Accountability'] },
    { id: 'gs2_gov_03', title: 'Welfare Schemes for Vulnerable Sections & NGO/SHG Role', pyq: 'High', microTopics: ['NABARD & SHG-Bank Linkage Programme', 'FCRA Regulation for NGOs'] },
    { id: 'gs2_gov_04', title: 'Issues relating to Health, Education & Human Resources', pyq: 'High', microTopics: ['National Education Policy NEP 2020', 'Ayushman Bharat & Healthcare Spending'] },
    { id: 'gs2_gov_05', title: 'India and its Neighbourhood Relations (South Asia)', pyq: 'High', microTopics: ['Neighborhood First Policy & SAARC/BIMSTEC', 'India-China Border & Ocean Strategy'] },
    { id: 'gs2_gov_06', title: 'Bilateral & Global Groupings (QUAD, BRICS, G2O, SCO, I2U2)', pyq: 'High', microTopics: ['QUAD Indo-Pacific Maritime Strategy', 'G20 Presidency & Global South'] },
    { id: 'gs2_gov_07', title: 'International Organisations (UN Reforms, WTO, IMF, World Bank)', pyq: 'High', microTopics: ['UNSC Expansion & G4 Aspirations', 'WTO Dispute Settlement Body Crisis'] }
  ],
  'GS3 - Economy & Agriculture': [
    { id: 'gs3_eco_01', title: 'Indian Economy & Planning, Growth, Development & Employment', pyq: 'High', microTopics: ['GDP Calculation & National Income', 'Jobless Growth & Informal Sector'] },
    { id: 'gs3_eco_02', title: 'Government Budgeting, Fiscal Policy & Taxation Reforms (GST)', pyq: 'High', microTopics: ['FRBM Act & Fiscal Deficit Targets', 'GST Council & Revenue Sharing'] },
    { id: 'gs3_eco_03', title: 'Monetary Policy, RBI, Inflation & Banking Sector NPA Reforms', pyq: 'High', microTopics: ['Monetary Policy Framework (MPC)', 'Insolvency & Bankruptcy Code (IBC)'] },
    { id: 'gs3_eco_04', title: 'Capital Market, Stock Exchanges & Financial Sector Inclusion', pyq: 'Medium', microTopics: ['SEBI Regulations & Primary Markets', 'Jan Dhan & Digital Payments UPI'] },
    { id: 'gs3_eco_05', title: 'Infrastructure: Energy, Ports, Roads, Airports, Railways', pyq: 'High', microTopics: ['PM Gati Shakti Master Plan', 'National Monetiisation Pipeline'] },
    { id: 'gs3_eco_06', title: 'Major Crops, Cropping Patterns, Irrigation Systems & E-Technology', pyq: 'High', microTopics: ['Micro-Irrigation & PM Krishi Sinchayee Yojana', 'Agri-Tech Startups & Drones'] },
    { id: 'gs3_eco_07', title: 'MSP, Direct/Indirect Subsidies & Public Distribution System (PDS)', pyq: 'High', microTopics: ['PM-KISAN & Direct Benefit Transfer', 'WTO Amber/Green Box Subsidies'] },
    { id: 'gs3_eco_08', title: 'Food Processing & Related Industries in India', pyq: 'High', microTopics: ['Mega Food Parks & PM-FME Scheme', 'Supply Chain Bottlenecks in Agri'] },
    { id: 'gs3_eco_09', title: 'Land Reforms in India & Agriculture Supply Chain', pyq: 'Medium', microTopics: ['Abolition of Zamindari & Tenancy Reforms', 'Digital Land Records (DILRMP)'] }
  ],
  'GS3 - Sci-Tech, Env & Security': [
    { id: 'gs3_sci_01', title: 'Science & Tech Achievements of Indians, Indigenisation & Tech Transfer', pyq: 'Medium', microTopics: ['C.V. Raman, Ramanujan & Bose Achievements', 'Defense Research & IRBM Missiles'] },
    { id: 'gs3_sci_02', title: 'IT, Space (ISRO Missions), Computers, Robotics, Nanotechnology', pyq: 'High', microTopics: ['Chandrayaan, Gaganyaan & Aditya-L1', '5G/6G Networks & Quantum Computing'] },
    { id: 'gs3_sci_03', title: 'Biotechnology & Intellectual Property Rights (IPR) Issues', pyq: 'High', microTopics: ['CRISPR-Cas9 & Gene Editing', 'Patent Act Section 3(d) & Compulsory Licensing'] },
    { id: 'gs3_env_01', title: 'Conservation, Environmental Pollution & Degradation (COP/UNFCCC)', pyq: 'High', microTopics: ['Paris Agreement & Net Zero Target 2070', 'Air Quality Index & Plastic Waste Rules'] },
    { id: 'gs3_env_02', title: 'Environmental Impact Assessment (EIA) & Wildlife Acts', pyq: 'High', microTopics: ['EIA Notification 2006 & Coastal Regulation', 'Wildlife Protection Act 1972 Schedules'] },
    { id: 'gs3_env_03', title: 'Disaster Management: NDMA Guidelines, Floods, Cyclones & Landslides', pyq: 'High', microTopics: ['Sendai Framework for Disaster Reduction', 'Early Warning Systems & NDRF Deployment'] },
    { id: 'gs3_sec_01', title: 'Linkages between Development and Extremism (Left Wing Extremism)', pyq: 'High', microTopics: ['Naxalism Causes in Red Corridor', 'SAMADHAN Doctrine for LWE'] },
    { id: 'gs3_sec_02', title: 'Cybersecurity, Basics of Cyber Warfare & Social Media Challenges', pyq: 'High', microTopics: ['CERT-In Guidelines & National Cyber Security Policy', 'Ransomware & Deepfakes Regulation'] },
    { id: 'gs3_sec_03', title: 'Money Laundering and its Prevention & Organised Crime Linkages', pyq: 'High', microTopics: ['PMLA Act Provisions & FATF Greylist', 'Drug Trafficking & Golden Crescent/Triangle'] },
    { id: 'gs3_sec_04', title: 'Border Area Security Management & Security Forces Structure', pyq: 'Medium', microTopics: ['Comprehensive Integrated Border Management (CIBMS)', 'Role of BSF, ITBP & Assam Rifles'] }
  ],
  'GS4 - Ethics & Aptitude': [
    { id: 'gs4_eth_01', title: 'Ethics and Human Interface: Essence, Determinants & Consequences', pyq: 'High', microTopics: ['Private vs Public Relations Ethics', 'Human Values Formation'] },
    { id: 'gs4_eth_02', title: 'Human Values: Lessons from Lives of Great Leaders & Reformers', pyq: 'High', microTopics: ['Mahatma Gandhi 7 Social Sins', 'APJ Abdul Kalam Vision'] },
    { id: 'gs4_eth_03', title: 'Attitude: Content, Structure, Function, Influence & Behavioral Relations', pyq: 'High', microTopics: ['Persuasion & Social Influence', 'Moral & Political Attitudes'] },
    { id: 'gs4_eth_04', title: 'Emotional Intelligence: Concepts & Utilities in Administration', pyq: 'High', microTopics: ['Goleman 5 Components of EI', 'Empathy & Compassion for Weaker Sections'] },
    { id: 'gs4_eth_05', title: 'Contributions of Moral Thinkers & Philosophers (Indian & Western)', pyq: 'High', microTopics: ['Socrates, Plato & Aristotle Virtues', 'Kantian Deontology vs Utilitarianism', 'Kautilya Arthashastra & Chanakya Niti'] },
    { id: 'gs4_eth_06', title: 'Public Service Values & Ethics in Public Administration', pyq: 'High', microTopics: ['Nolan Committee 7 Principles', 'Conflict of Interest & Integrity'] },
    { id: 'gs4_eth_07', title: 'Probity in Governance, Transparency & Information Sharing', pyq: 'High', microTopics: ['Work Culture & Quality of Service', 'Utilization of Public Funds'] },
    { id: 'gs4_eth_08', title: 'Case Studies on Ethical Dilemmas in Public Administration', pyq: 'High', microTopics: ['Conflict between Law vs Conscience', 'Environmental vs Industrial Development Case'] }
  ],
  'CSAT & Current Affairs': [
    { id: 'csat_01', title: 'Reading Comprehension Strategies & Practice Modules', pyq: 'High', microTopics: ['Inference & Assumption Passage Types', 'Main Idea & Title Identification'] },
    { id: 'csat_02', title: 'Quantitative Aptitude: Number System, Percentages & Profit/Loss', pyq: 'High', microTopics: ['Divisibility Rules & Remainder Theorem', 'Ratio-Proportion & Percentage Formulas'] },
    { id: 'csat_03', title: 'Quantitative Aptitude: Time-Work, Speed-Distance & Permutations', pyq: 'High', microTopics: ['Relative Speed & Train Problems', 'Combinatorics & Probability'] },
    { id: 'csat_04', title: 'Logical Reasoning, Data Interpretation & Syllogisms', pyq: 'High', microTopics: ['Seating Arrangement & Blood Relations', 'Venn Diagrams & Statement Conclusions'] },
    { id: 'ca_01', title: 'Monthly Current Affairs Analysis (Polity, Economy & IR)', pyq: 'High', microTopics: ['Bills & Acts Passed in Parliament', 'Bilateral Treaties & Bilateral Summits'] },
    { id: 'ca_02', title: 'Monthly Current Affairs Analysis (Environment, S&T, Reports)', pyq: 'High', microTopics: ['New Species Discovered & Protected Areas', 'Global Indices & World Bank Reports'] },
    { id: 'ca_03', title: 'Economic Survey & Union Budget Analysis', pyq: 'High', microTopics: ['Key Macroeconomic Indicators', 'Budget Capital Outlays & Schemes'] },
    { id: 'ca_04', title: 'Yearly Compilations (PT 365 / Mains 365 Modules)', pyq: 'High', microTopics: ['Prelims High-Yield Topics', 'Mains Answer Writing Frameworks'] }
  ]
};


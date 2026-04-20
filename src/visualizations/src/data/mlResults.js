// Hardcoded ML results from dva_continuation.ipynb (DBSCAN country clustering, eps=2.36, min_samples=3)
// Matches Table 3 in report_data_pipeline.tex

export const CLUSTERS = {
  0: {
    label: 'Gulf / Middle East',
    color: '#ff6b6b',
    distinguishing: 'Highest engagement (0.006); fast time-to-trend (22.7 hrs)',
    countries: ['AE','BH','DZ','EG','IQ','JO','KW','LB','LY','MA','OM','QA','SA','TN','YE'],
    profile: { mean_duration: 372.3, mean_ttt: 22.7, mean_engagement: 0.006, mean_views: 1270783, n_categories: 15 },
  },
  1: {
    label: 'Latin America A (Central)',
    color: '#ffe66d',
    distinguishing: 'High Music share; fast time-to-trend (21.9 hrs)',
    countries: ['AR','CR','DO','GT','HN','MX','NI','PA','UY'],
    profile: { mean_duration: 380.2, mean_ttt: 21.9, mean_engagement: 0.005, mean_views: 1334650, n_categories: 15 },
  },
  2: {
    label: 'Western Anglosphere',
    color: '#4ecdc4',
    distinguishing: 'Shortest duration (148 hrs); fastest content cycle',
    countries: ['AT','AU','CA','DE','FR','GB','US'],
    profile: { mean_duration: 147.8, mean_ttt: 16.6, mean_engagement: 0.005, mean_views: 842481, n_categories: 15 },
  },
  3: {
    label: 'Central / Eastern Europe',
    color: '#a06cd5',
    distinguishing: 'Highest views (4.35M); slow time-to-trend (71.3 hrs)',
    countries: ['BA','BE','BG','CH','CZ','GR','HR','IL','LI','ME','MK','NL','RS','SI','SK'],
    profile: { mean_duration: 342.5, mean_ttt: 71.3, mean_engagement: 0.002, mean_views: 4345579, n_categories: 15 },
  },
  4: {
    label: 'Latin America B (Andean)',
    color: '#ff9f43',
    distinguishing: 'Moderate profile; 14 distinct categories',
    countries: ['BO','CL','CO','EC','PE','PY'],
    profile: { mean_duration: 295.6, mean_ttt: 20.0, mean_engagement: 0.005, mean_views: 1091581, n_categories: 14 },
  },
  5: {
    label: 'Nordic / Oceania',
    color: '#54a0ff',
    distinguishing: 'Highest views (4.36M); slow time-to-trend (71.8 hrs)',
    countries: ['DK','IE','NO','NZ','SE'],
    profile: { mean_duration: 353.2, mean_ttt: 71.8, mean_engagement: 0.002, mean_views: 4361375, n_categories: 14 },
  },
  '-1': {
    label: 'Noise (no dominant archetype)',
    color: '#555555',
    distinguishing: 'Diverse outliers across Asia, Sub-Saharan Africa, Eastern Europe',
    countries: ['AZ','BR','BY','CY','EE','ES','FI','GE','GH','HK','HU','ID','IN','IS','IT','JM','JP','KE','KR','KZ','LK','LT','LU','LV','MT','MY','NG','NP','PH','PK','PL','PR','PT','RO','RU','SG','SN','SV','TH','TR','TW','TZ','UA','UG','VN','ZA','ZW'],
    profile: { mean_duration: 305.9, mean_ttt: 58.2, mean_engagement: 0.003, mean_views: 3662562, n_categories: 14.8 },
  },
};

// ISO-2 -> DBSCAN cluster id
export const COUNTRY_CLUSTER = Object.entries(CLUSTERS).reduce((acc, [cid, info]) => {
  info.countries.forEach((cc) => { acc[cc] = Number(cid); });
  return acc;
}, {});

// Convergence metrics from the notebook
export const CONVERGENCE = {
  entropy_by_year: [
    { year: 2022, entropy: 3.1395 },
    { year: 2023, entropy: 3.1216 },
    { year: 2024, entropy: 3.1201 },
    { year: 2025, entropy: 3.1161 },
  ],
  top3_by_year: [
    { year: 2022, share: 0.5335 },
    { year: 2023, share: 0.5406 },
    { year: 2024, share: 0.5656 },
    { year: 2025, share: 0.5659 },
  ],
  similarity_by_year: [
    { year: 2022, sim: 0.8490 },
    { year: 2023, sim: 0.8560 },
    { year: 2024, sim: 0.8669 },
    { year: 2025, sim: 0.8534 },
  ],
  median_survival_days: [
    { year: 2022, days: 14.3 },
    { year: 2023, days: 15.0 },
    { year: 2024, days: 15.7 },
    { year: 2025, days: 15.9 },
  ],
};

export const DBSCAN_META = {
  eps: 2.36,
  min_samples: 3,
  n_clusters: 6,
  n_noise: 47,
  n_countries: 104,
  feature_dim: 21,
};

// ISO alpha-2 -> country name (for tooltip / readout)
export const COUNTRY_NAME = {
  AE:'United Arab Emirates', AR:'Argentina', AT:'Austria', AU:'Australia', AZ:'Azerbaijan',
  BA:'Bosnia & Herzegovina', BE:'Belgium', BG:'Bulgaria', BH:'Bahrain', BO:'Bolivia',
  BR:'Brazil', BY:'Belarus', CA:'Canada', CH:'Switzerland', CL:'Chile', CO:'Colombia',
  CR:'Costa Rica', CY:'Cyprus', CZ:'Czechia', DE:'Germany', DK:'Denmark', DO:'Dominican Rep.',
  DZ:'Algeria', EC:'Ecuador', EE:'Estonia', EG:'Egypt', ES:'Spain', FI:'Finland', FR:'France',
  GB:'United Kingdom', GE:'Georgia', GH:'Ghana', GR:'Greece', GT:'Guatemala', HK:'Hong Kong',
  HN:'Honduras', HR:'Croatia', HU:'Hungary', ID:'Indonesia', IE:'Ireland', IL:'Israel',
  IN:'India', IQ:'Iraq', IS:'Iceland', IT:'Italy', JM:'Jamaica', JO:'Jordan', JP:'Japan',
  KE:'Kenya', KR:'South Korea', KW:'Kuwait', KZ:'Kazakhstan', LB:'Lebanon', LI:'Liechtenstein',
  LK:'Sri Lanka', LT:'Lithuania', LU:'Luxembourg', LV:'Latvia', LY:'Libya', MA:'Morocco',
  ME:'Montenegro', MK:'North Macedonia', MT:'Malta', MX:'Mexico', MY:'Malaysia', NG:'Nigeria',
  NI:'Nicaragua', NL:'Netherlands', NO:'Norway', NP:'Nepal', NZ:'New Zealand', OM:'Oman',
  PA:'Panama', PE:'Peru', PH:'Philippines', PK:'Pakistan', PL:'Poland', PR:'Puerto Rico',
  PT:'Portugal', PY:'Paraguay', QA:'Qatar', RO:'Romania', RS:'Serbia', RU:'Russia',
  SA:'Saudi Arabia', SE:'Sweden', SG:'Singapore', SI:'Slovenia', SK:'Slovakia', SN:'Senegal',
  SV:'El Salvador', TH:'Thailand', TN:'Tunisia', TR:'Türkiye', TW:'Taiwan', TZ:'Tanzania',
  UA:'Ukraine', UG:'Uganda', US:'United States', UY:'Uruguay', VN:'Vietnam', YE:'Yemen',
  ZA:'South Africa', ZW:'Zimbabwe',
};

// ISO alpha-2 -> ISO numeric (used by world-atlas topojson feature.id)
// Covers every country in the dataset (104) plus all others so the map still renders.
export const ISO2_TO_NUMERIC = {
  AF:'004',AL:'008',DZ:'012',AS:'016',AD:'020',AO:'024',AG:'028',AR:'032',AM:'051',AW:'533',
  AU:'036',AT:'040',AZ:'031',BS:'044',BH:'048',BD:'050',BB:'052',BY:'112',BE:'056',BZ:'084',
  BJ:'204',BM:'060',BT:'064',BO:'068',BA:'070',BW:'072',BR:'076',VG:'092',BN:'096',BG:'100',
  BF:'854',BI:'108',KH:'116',CM:'120',CA:'124',CV:'132',KY:'136',CF:'140',TD:'148',CL:'152',
  CN:'156',CO:'170',KM:'174',CD:'180',CG:'178',CR:'188',CI:'384',HR:'191',CU:'192',CY:'196',
  CZ:'203',DK:'208',DJ:'262',DM:'212',DO:'214',EC:'218',EG:'818',SV:'222',GQ:'226',ER:'232',
  EE:'233',SZ:'748',ET:'231',FJ:'242',FI:'246',FR:'250',PF:'258',GA:'266',GM:'270',GE:'268',
  DE:'276',GH:'288',GR:'300',GL:'304',GD:'308',GT:'320',GN:'324',GW:'624',GY:'328',HT:'332',
  HN:'340',HK:'344',HU:'348',IS:'352',IN:'356',ID:'360',IR:'364',IQ:'368',IE:'372',IL:'376',
  IT:'380',JM:'388',JP:'392',JO:'400',KZ:'398',KE:'404',KI:'296',KP:'408',KR:'410',KW:'414',
  KG:'417',LA:'418',LV:'428',LB:'422',LS:'426',LR:'430',LY:'434',LI:'438',LT:'440',LU:'442',
  MO:'446',MG:'450',MW:'454',MY:'458',MV:'462',ML:'466',MT:'470',MH:'584',MR:'478',MU:'480',
  MX:'484',FM:'583',MD:'498',MC:'492',MN:'496',ME:'499',MA:'504',MZ:'508',MM:'104',NA:'516',
  NR:'520',NP:'524',NL:'528',NC:'540',NZ:'554',NI:'558',NE:'562',NG:'566',MK:'807',NO:'578',
  OM:'512',PK:'586',PW:'585',PA:'591',PG:'598',PY:'600',PE:'604',PH:'608',PL:'616',PT:'620',
  PR:'630',QA:'634',RO:'642',RU:'643',RW:'646',KN:'659',LC:'662',VC:'670',WS:'882',SM:'674',
  ST:'678',SA:'682',SN:'686',RS:'688',SC:'690',SL:'694',SG:'702',SK:'703',SI:'705',SB:'090',
  SO:'706',ZA:'710',SS:'728',ES:'724',LK:'144',SD:'729',SR:'740',SE:'752',CH:'756',SY:'760',
  TW:'158',TJ:'762',TZ:'834',TH:'764',TL:'626',TG:'768',TO:'776',TT:'780',TN:'788',TR:'792',
  TM:'795',UG:'800',UA:'804',AE:'784',GB:'826',US:'840',UY:'858',UZ:'860',VU:'548',VE:'862',
  VN:'704',YE:'887',ZM:'894',ZW:'716',
};

export const NUMERIC_TO_ISO2 = Object.entries(ISO2_TO_NUMERIC).reduce((acc, [k, v]) => {
  acc[v] = k; return acc;
}, {});

// BERTopic sub-topic rank mobility — top 6 sub-topics per category across 2022-2025
// rank[i][year] = 1-indexed rank in that category's sub-topic list (null = outside top 10)
// share[i][year] = % of that category's videos in the sub-topic
// Source: notebook cell 360180ed (plot_top_subtopics output shown in DVA_Midterm_Report screenshots)
export const BERTOPIC_SUBTOPICS = {
  Entertainment: {
    topics:  ['TV/Episode', 'TV/Serial', 'Movies', 'Turkish TV', 'Serial Drama', 'Rage/Shorts'],
    colors:  ['#ff8a8a',    '#ffe66d',   '#4ecdc4', '#a06cd5',    '#ff9f43',      '#54a0ff'],
    ranks:   [[2,1,1,1],[1,2,2,2],[4,4,3,3],[6,7,7,6],[7,5,6,7],[null,10,10,null]],
    shares:  [[12.1,12.3,15.9,17.8],[15.4,16.3,15.7,15.0],[9.9,9.0,7.8,7.4],[4.6,4.2,4.7,5.6],[4.1,3.9,4.2,3.7],[null,3.2,2.4,null]],
  },
  Sports: {
    topics:  ['Highlights', 'Real Madrid', 'League',  'Maroc/Van', 'Man United', 'Cup Ties'],
    colors:  ['#ff8a8a',    '#ffe66d',     '#4ecdc4', '#a06cd5',   '#ff9f43',    '#54a0ff'],
    ranks:   [[1,1,1,1],[2,2,2,2],[3,3,3,3],[7,6,8,7],[9,8,7,9],[null,null,9,9]],
    shares:  [[8.9,9.7,10.0,9.4],[7.8,7.4,8.3,8.6],[7.3,7.0,6.0,7.0],[3.9,3.8,3.2,3.0],[3.1,3.2,3.2,3.0],[null,null,2.8,2.8]],
  },
  Gaming: {
    topics:  ['MC+FIFA',  'MC+Fortnite', 'GTA+FC',  'Dinosaurios', 'Roblox',  'Free Games'],
    colors:  ['#ff8a8a',  '#ffe66d',     '#4ecdc4', '#a06cd5',     '#ff9f43', '#54a0ff'],
    ranks:   [[1,1,1,1],[4,2,2,2],[2,3,3,null],[6,6,9,10],[8,7,5,3],[10,8,7,5]],
    shares:  [[7.9,7.6,6.7,7.4],[3.4,3.9,4.9,4.7],[4.0,3.7,3.7,null],[2.8,2.8,2.5,2.7],[2.2,2.5,3.0,3.8],[2.1,2.5,2.9,3.3]],
  },
  Music: {
    topics:  ['Song+MV', 'New Songs', 'Video+New', 'Benson Boone', 'Contro Te', 'BIAAS'],
    colors:  ['#ff8a8a', '#ffe66d',   '#4ecdc4',   '#a06cd5',      '#ff9f43',   '#54a0ff'],
    ranks:   [[1,1,1,1],[3,2,2,2],[2,3,3,3],[5,5,5,9],[6,4,7,8],[8,8,4,4]],
    shares:  [[8.9,9.6,10.8,10.5],[4.9,6.3,7.6,7.6],[6.1,6.2,6.8,7.0],[3.7,3.5,2.9,2.5],[3.5,3.5,2.9,2.6],[2.6,2.7,3.3,4.1]],
  },
  'P & Blogs': {
    topics:  ['Shorts+Vlogs', 'Family Vlogs', 'Funny Shorts', 'TikTok Vlogs', 'Global',  'Challenge'],
    colors:  ['#ff8a8a',      '#ffe66d',      '#4ecdc4',      '#a06cd5',       '#ff9f43', '#54a0ff'],
    ranks:   [[2,1,1,1],[1,2,2,2],[4,4,4,4],[10,6,5,5],[6,10,10,7],[5,5,6,null]],
    shares:  [[10.6,11.8,12.9,12.6],[11.3,10.2,9.0,9.2],[6.6,7.3,7.5,8.3],[3.0,3.8,4.5,5.1],[4.8,3.0,2.5,2.7],[5.7,5.5,4.5,null]],
  },
};

// Monthly video entries vs exits — Jul 2022 to Jun 2025 (notebook cell 9d1cfb86)
export const MONTHLY_CHURN = [
  { month: '07/22', entries: 72400, exits: 68200 },
  { month: '08/22', entries: 68100, exits: 64800 },
  { month: '09/22', entries: 75800, exits: 71400 },
  { month: '10/22', entries: 79200, exits: 74600 },
  { month: '11/22', entries: 81400, exits: 76800 },
  { month: '12/22', entries: 88600, exits: 83200 },
  { month: '01/23', entries: 76200, exits: 71400 },
  { month: '02/23', entries: 71800, exits: 67200 },
  { month: '03/23', entries: 78400, exits: 73800 },
  { month: '04/23', entries: 77200, exits: 72600 },
  { month: '05/23', entries: 80100, exits: 75400 },
  { month: '06/23', entries: 82600, exits: 78000 },
  { month: '07/23', entries: 79800, exits: 75200 },
  { month: '08/23', entries: 74200, exits: 70100 },
  { month: '09/23', entries: 83400, exits: 79100 },
  { month: '10/23', entries: 86800, exits: 82400 },
  { month: '11/23', entries: 88200, exits: 83800 },
  { month: '12/23', entries: 95400, exits: 90200 },
  { month: '01/24', entries: 82600, exits: 78800 },
  { month: '02/24', entries: 78400, exits: 74200 },
  { month: '03/24', entries: 85200, exits: 81400 },
  { month: '04/24', entries: 83800, exits: 79600 },
  { month: '05/24', entries: 87400, exits: 83200 },
  { month: '06/24', entries: 89600, exits: 85400 },
  { month: '07/24', entries: 86200, exits: 82400 },
  { month: '08/24', entries: 80800, exits: 77200 },
  { month: '09/24', entries: 91400, exits: 87600 },
  { month: '10/24', entries: 94200, exits: 90400 },
  { month: '11/24', entries: 96800, exits: 92600 },
  { month: '12/24', entries: 104200, exits: 99800 },
  { month: '01/25', entries: 88600, exits: 84800 },
  { month: '02/25', entries: 84200, exits: 80600 },
  { month: '03/25', entries: 91800, exits: 88200 },
  { month: '04/25', entries: 90400, exits: 86800 },
  { month: '05/25', entries: 94600, exits: 91200 },
  { month: '06/25', entries: 92800, exits: 89400 },
];

// Category composition over time — quarterly shares for top 8 categories (notebook cell f1ee517e)
export const CATEGORY_STREAM = [
  { period: 'Q3\'22', Entertainment: 0.278, Gaming: 0.126, 'People & Blogs': 0.131, Sports: 0.135, Music: 0.108, 'News & Politics': 0.090, Education: 0.068, Comedy: 0.064 },
  { period: 'Q4\'22', Entertainment: 0.283, Gaming: 0.138, 'People & Blogs': 0.128, Sports: 0.118, Music: 0.110, 'News & Politics': 0.088, Education: 0.068, Comedy: 0.067 },
  { period: 'Q1\'23', Entertainment: 0.276, Gaming: 0.127, 'People & Blogs': 0.129, Sports: 0.141, Music: 0.111, 'News & Politics': 0.092, Education: 0.058, Comedy: 0.066 },
  { period: 'Q2\'23', Entertainment: 0.281, Gaming: 0.124, 'People & Blogs': 0.132, Sports: 0.128, Music: 0.113, 'News & Politics': 0.086, Education: 0.070, Comedy: 0.066 },
  { period: 'Q3\'23', Entertainment: 0.284, Gaming: 0.128, 'People & Blogs': 0.130, Sports: 0.130, Music: 0.109, 'News & Politics': 0.085, Education: 0.068, Comedy: 0.066 },
  { period: 'Q4\'23', Entertainment: 0.289, Gaming: 0.140, 'People & Blogs': 0.127, Sports: 0.114, Music: 0.108, 'News & Politics': 0.088, Education: 0.069, Comedy: 0.065 },
  { period: 'Q1\'24', Entertainment: 0.282, Gaming: 0.130, 'People & Blogs': 0.128, Sports: 0.138, Music: 0.112, 'News & Politics': 0.091, Education: 0.056, Comedy: 0.063 },
  { period: 'Q2\'24', Entertainment: 0.285, Gaming: 0.126, 'People & Blogs': 0.131, Sports: 0.131, Music: 0.114, 'News & Politics': 0.084, Education: 0.064, Comedy: 0.065 },
  { period: 'Q3\'24', Entertainment: 0.292, Gaming: 0.131, 'People & Blogs': 0.128, Sports: 0.125, Music: 0.108, 'News & Politics': 0.082, Education: 0.069, Comedy: 0.065 },
  { period: 'Q4\'24', Entertainment: 0.296, Gaming: 0.143, 'People & Blogs': 0.125, Sports: 0.112, Music: 0.107, 'News & Politics': 0.086, Education: 0.068, Comedy: 0.063 },
  { period: 'Q1\'25', Entertainment: 0.288, Gaming: 0.134, 'People & Blogs': 0.127, Sports: 0.136, Music: 0.112, 'News & Politics': 0.088, Education: 0.055, Comedy: 0.060 },
  { period: 'Q2\'25', Entertainment: 0.294, Gaming: 0.129, 'People & Blogs': 0.126, Sports: 0.128, Music: 0.111, 'News & Politics': 0.083, Education: 0.066, Comedy: 0.063 },
];

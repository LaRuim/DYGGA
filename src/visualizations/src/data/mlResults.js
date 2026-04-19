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

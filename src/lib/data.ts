import { ClipboardPenLine, Send, Gavel, CircleDollarSign, LucideIcon } from "lucide-react";

type ApplicationStage = {
  name: string;
  icon: LucideIcon;
};

export const applicationStages: ApplicationStage[] = [
  { name: 'eligibilityDataCollection', icon: ClipboardPenLine },
  { name: 'applicationSubmittedStage', icon: Send },
  { name: 'verificationApproval', icon: Gavel },
  { name: 'beneficiaryPayment', icon: CircleDollarSign },
];

export type ChecklistItemStatus = 'completed' | 'current' | 'upcoming';

export type ChecklistItem = {
  text: string;
  status: ChecklistItemStatus;
};

export const initialChecklist: ChecklistItem[] = [
    { text: 'provideAadhaar', status: 'upcoming' },
    { text: 'appAutofilled', status: 'upcoming' },
    { text: 'undergoingVerification', status: 'upcoming' },
    { text: 'awaitingInclusion', status: 'upcoming' },
    { text: 'firstInstallment', status: 'upcoming' },
];

export const cscLocations = [
    { name: 'CSC Center Rampur', address: '123, Main Market, Rampur, Sitapur', hours: '9 AM - 6 PM' },
    { name: 'Digital Seva Kendra', address: 'Near Bus Stand, Rampur, Sitapur', hours: '10 AM - 7 PM' },
];

export const requiredDocuments = [
    'Aadhaar card',
    'Proof of citizenship',
    'Documents showing ownership of land (khatoni/khasra)',
    'Bank account details (Bank Passbook)',
    'Registered mobile number for OTP',
];
export type Artwork = {
  id: number;
  type: 'image' | 'video' | 'text';
  title: string;
  artist: string;
  imageUrl?: string;
  videoUrl?: string;
  content?: string;
  likes: number;
  commentsCount: number;
  tags: string[];
  isUserSubmission: boolean;
  aiHint?: string;
};

export const standUpIndiaDocuments = [
    'Proof of Identity (Aadhaar, PAN Card)',
    'Proof of Residence',
    'Business Address Proof',
    'Caste/Tribe Certificate (for SC/ST)',
    'Certificate of Incorporation (if applicable)',
    'Project Report with Financials',
];

export const sfurtiDocuments = [
    'Cluster Proposal/Detailed Project Report (DPR)',
    'Documents of Implementing Agency/NGO/Institution',
    'Land Documents for Common Facility Center (CFC)',
    'List of Artisans in the Cluster',
    'Bank Account Details',
];

export const ahvyDocuments = [
    'Artisan ID Card',
    'Aadhaar Card',
    'Bank Account Details',
    'Caste Certificate (if applicable)',
    'Proof of being part of a Self-Help Group (SHG)',
];

export const pmegpDocuments = [
    'Aadhaar Card',
    'PAN Card',
    'Project Report',
    'Caste/Special Category Certificate',
    'Rural Area Certificate',
    'Education/Skill Training Certificate',
];

export const skillIndiaDocuments = [
    'Aadhaar Card',
    'Bank Account Details',
    'Passport-sized Photographs',
    'Mobile Number',
];

export const cgtmseDocuments = [
    'Business Plan or Project Report',
    'PAN Card',
    'Business Registration Documents',
    'Loan Application Form from the Bank',
];


export const artworks: Artwork[] = [
  {
    id: 1,
    type: 'image',
    title: "दिव्य यात्रा",
    artist: "अरोरा ब्लिस",
    imageUrl: "https://picsum.photos/600/800?random=1",
    likes: 125,
    commentsCount: 12,
    tags: ["अंतरिक्ष", "अमूर्त", "डिजिटल"],
    isUserSubmission: true,
    aiHint: "galaxy stars"
  },
  {
    id: 2,
    type: 'image',
    title: "वन आत्मा",
    artist: "लियो एवरग्रीन",
    imageUrl: "https://picsum.photos/800/600?random=2",
    likes: 340,
    commentsCount: 45,
    tags: ["प्रकृति", "काल्पनिक", "पेंटिंग"],
    isUserSubmission: false,
    aiHint: "mystical forest"
  },
  {
    id: 9,
    type: 'video',
    title: "प्रकाश को गढ़ना",
    artist: "जूलियन फॉर्म",
    imageUrl: "https://picsum.photos/800/450?random=9",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    likes: 280,
    commentsCount: 35,
    tags: ["मूर्ति", "टाइमलैप्स", "प्रक्रिया"],
    isUserSubmission: true,
    aiHint: "sculpture timelapse",
  },
  {
    id: 3,
    type: 'image',
    title: "महानगर के सपने",
    artist: "साइबेरिया नोवा",
    imageUrl: "https://picsum.photos/700/700?random=3",
    likes: 88,
    commentsCount: 8,
    tags: ["cityscape", "futuristic", "3d-render"],
    isUserSubmission: false,
    aiHint: "future city"
  },
  {
    id: 10,
    type: 'text',
    title: "रंग सिद्धांत पर विचार",
    artist: "आइरिस ह्यू",
    content: "रंग केवल एक दृश्य अनुभव से कहीं अधिक है; यह एक भाषा है। लाल रंग की गर्मी जुनून या खतरे को व्यक्त कर सकती है, जबकि नीले रंग की ठंडक शांति या उदासी पैदा कर सकती है। अपने काम में, मैं रंगों के बीच एक संवाद बनाने की कोशिश करता हूं, जिससे वे एक दूसरे के साथ खेलकर एक ऐसा मूड बनाते हैं जो कैनवास से परे हो।",
    likes: 55,
    commentsCount: 15,
    tags: ["सिद्धांत", "प्रतिबिंब", "लेखन"],
    isUserSubmission: false,
  },
  {
    id: 4,
    type: 'image',
    title: "महासागर का आलिंगन",
    artist: "मरीना वेव्स",
    imageUrl: "https://picsum.photos/600/900?random=4",
    likes: 450,
    commentsCount: 67,
    tags: ["महासागर", "यथार्थवाद", "oil-on-canvas"],
    isUserSubmission: true,
    aiHint: "ocean wave"
  },
  {
    id: 11,
    type: 'video',
    title: "मेरी मिट्टी के बर्तनों की प्रक्रिया",
    artist: "क्लेटन पॉटर",
    imageUrl: "https://picsum.photos/800/450?random=11",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    likes: 180,
    commentsCount: 28,
    tags: ["मिट्टी के बर्तन", "ट्यूटोरियल", "शिल्प"],
    isUserSubmission: false,
    aiHint: "pottery wheel",
  },
  {
    id: 5,
    type: 'image',
    title: "हस्तनिर्मित फूलदान",
    artist: "क्लेटन पॉटर",
    imageUrl: "https://picsum.photos/600/600?random=5",
    likes: 210,
    commentsCount: 22,
    tags: ["मिट्टी के बर्तन", "हस्तशिल्प", "कारीगर"],
    isUserSubmission: false,
    aiHint: "pottery vase"
  },
  {
    id: 12,
    type: 'image',
    title: "कंक्रीट बेल",
    artist: "साइबेरिया नोवा",
    imageUrl: "https://picsum.photos/600/800?random=12",
    likes: 150,
    commentsCount: 18,
    tags: ["שहरी जंगल", "चुनौती", "फोटोग्राफी"],
    isUserSubmission: false,
    aiHint: "plant building"
  },
  {
    id: 6,
    type: 'image',
    title: "मौन प्रहरी",
    artist: "नोक्टर्ना",
    imageUrl: "https://picsum.photos/800/800?random=6",
    likes: 199,
    commentsCount: 31,
    tags: ["जानवर", "वन्यजीव", "फोटोग्राफी"],
    isUserSubmission: false,
    aiHint: "owl night"
  },
    {
    id: 13,
    type: 'text',
    title: "शहर सॉनेट",
    artist: "लेक्स वर्ड और साइबेरिया नोवा",
    content: "जहां स्टील की जड़ें सूरज को चूमने के लिए चढ़ती हैं, एक कंक्रीट की छतरी, किसी से कम नहीं। हरी लताएं दरारों और सीमों का नक्शा बनाती हैं, एक जंगली जीवन शहर के सपनों को पूरा करता है। ('शहरी जंगल' चुनौती के लिए एक सहयोग)।",
    likes: 95,
    commentsCount: 25,
    tags: ["शहरी जंगल", "कविता", "सहयोग", "चुनौती"],
    isUserSubmission: true,
  },
  {
    id: 7,
    type: 'image',
    title: "रेगिस्तानी मृगतृष्णा",
    artist: "सैंडी ड्यून्स",
    imageUrl: "https://picsum.photos/900/600?random=7",
    likes: 76,
    commentsCount: 5,
    tags: ["परिदृश्य", "रेगिस्तान", "जल रंग"],
    isUserSubmission: true,
    aiHint: "desert dunes"
  },
  {
    id: 8,
    type: 'image',
    title: "बुने हुए सपने",
    artist: "पेनेलोप वीव",
    imageUrl: "https://picsum.photos/700/800?random=8",
    likes: 154,
    commentsCount: 19,
    tags: ["कपड़ा", "हस्तशिल्प", "टेपेस्ट्री"],
    isUserSubmission: false,
    aiHint: "woven tapestry"
  },
  {
    id: 14,
    type: 'video',
    title: "छत पर बगीचे का टाइमलैप्स",
    artist: "लियो एवरग्रीन",
    imageUrl: "https://picsum.photos/800/450?random=14",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    likes: 220,
    commentsCount: 30,
    tags: ["शहरी जंगल", "टाइमलैप्स", "बागवानी", "चुनौती"],
    isUserSubmission: false,
    aiHint: "rooftop garden",
  },
];

export type Benefit = {
  title: string;
  description: string;
};

export type ArtisanScheme = {
    id: string;
    name: string;
    description: string;
    highlight: string;
    benefits: Benefit[];
    applicationStages: ApplicationStage[];
    checklist: ChecklistItem[];
    requiredDocuments: string[];
    aiScore: number;
    eligibilityMatch: number;
    benefitPotential: number;
    successProbability: number;
    immediateActions: string[];
    timeline: string;
    riskFactors: string[];
    portal: string;
};

export const pmVishwakarmaDocuments = [
    'Aadhaar Card',
    'Bank Account Passbook',
    'Ration Card',
    'Artisan ID Card (if available)',
    'Proof of Trade/Craft',
];

export const mudraYojanaDocuments = [
    'Proof of Identity (Aadhaar, Voter ID)',
    'Proof of Residence (Electricity Bill, etc.)',
    'Business Plan or Proposal',
    'Quotation for Machinery/Items',
    'Passport-sized Photographs',
];

export const pmVishwakarmaBenefits: Benefit[] = [
  {
    title: 'Recognition',
    description: 'Recognition of artisans and craftspeople through PM Vishwakarma certificate and ID card.'
  },
  {
    title: 'Skill Upgradation',
    description: 'Basic Training of 5-7 days and Advanced Training of 15 days or more, with a stipend of Rs. 500 per day.'
  },
  {
    title: 'Toolkit Incentive',
    description: 'A toolkit incentive of upto Rs. 15,000 in the form of e-vouchers at the beginning of Basic Skill Training.'
  },
  {
    title: 'Credit Support',
    description: 'Collateral free ‘Enterprise Development Loans’ of upto Rs. 3 lakh in two tranches of Rs. 1 lakh and Rs. 2 lakh with tenures of 18 months and 30 months, respectively, at a concessional rate of interest fixed at 5%.'
  },
  {
    title: 'Incentive for Digital Transaction',
    description: 'An amount of Re. 1 per digital transaction, upto maximum 100 transactions monthly will be credited to the beneficiary’s account for each digital pay-out or receipt.'
  },
  {
    title: 'Marketing Support',
    description: 'Marketing support will be provided to the artisans and craftspeople in the form of quality certification, branding, onboarding on e-commerce platforms such as GeM, advertising, publicity and other marketing activities to improve linkage to value chain.'
  }
];

export const sfurtiBenefits: Benefit[] = [
  {
    title: 'Infrastructure Support',
    description: 'Financial support for setting up common facility centers (CFCs) for production, quality control, and packaging.'
  },
  {
    title: 'Skill Development',
    description: 'Assistance for skill development and capacity building of artisans.'
  },
  {
    title: 'Marketing Support',
    description: 'Market promotion and development support, including participation in trade fairs and exhibitions.'
  },
  {
    title: 'Exposure Visits',
    description: 'Exposure visits to other clusters and institutions to learn best practices.'
  }
];

export const ahvyBenefits: Benefit[] = [
    { title: 'Community Mobilization', description: 'Baseline survey and mobilization of artisans into self-help groups (SHGs).' },
    { title: 'Skill Upgradation', description: 'Skill upgradation and training in technical and managerial aspects.' },
    { title: 'Toolkit and Facilities', description: 'Provision of common facility centers and toolkits to artisans.' },
    { title: 'Design Development', description: 'Design and technology workshops to develop new products.' },
    { title: 'Marketing Assistance', description: 'Marketing support through exhibitions, craft bazars, and online platforms.' }
];

export const pmegpBenefits: Benefit[] = [
    { title: 'Subsidy on Project Cost', description: 'Financial assistance in the form of a subsidy on the project cost.' },
    { title: 'Loan Facility', description: 'Loan facilities from banks to cover the remaining cost of the project.' },
    { title: 'Collateral-Free Loans', description: 'No collateral required for loans up to a certain limit.' },
    { title: 'Nationwide Coverage', description: 'Support for setting up ventures in both urban and rural areas.' }
];

export const skillIndiaBenefits: Benefit[] = [
    { title: 'Certified Training', description: 'Access to certified training programs in various crafts.' },
    { title: 'Modern Techniques', description: 'Training on modern tools and techniques.' },
    { title: 'Quality Improvement', description: 'Emphasis on quality and design improvement.' },
    { title: 'Skill Recognition', description: 'Certification and recognition of skills, which can help in getting better job opportunities.' }
];

export const cgtmseBenefits: Benefit[] = [
    { title: 'Collateral-Free Loans', description: 'Collateral-free loans from banks and other financial institutions.' },
    { title: 'Credit Guarantee', description: 'Credit guarantee coverage for a significant portion of the loan amount.' },
    { title: 'Increased Access to Finance', description: 'Increased access to finance for new and existing enterprises.' },
    { title: 'Working Capital Support', description: 'Support for both working capital and term loan requirements.' }
];

export const artisanSchemes: ArtisanScheme[] = [
    {
        id: 'pm-vishwakarma',
        name: 'PM Vishwakarma',
        description: 'A central sector scheme to provide end-to-end support to artisans and craftspeople.',
        highlight: 'Comprehensive support including skill training, credit access, and marketing.',
        benefits: pmVishwakarmaBenefits,
        applicationStages: applicationStages,
        checklist: initialChecklist,
        requiredDocuments: pmVishwakarmaDocuments,
        aiScore: 92,
        eligibilityMatch: 95,
        benefitPotential: 90,
        successProbability: 88,
        immediateActions: [
            'Enroll through the PM Vishwakarma portal',
            'Complete e-KYC',
        ],
        timeline: '2-4 weeks',
        riskFactors: ['Initial verification delay', 'Competition for training slots'],
        portal: 'https://pmvishwakarma.gov.in/',
    },
    {
        id: 'mudra-yojana',
        name: 'Mudra Yojana',
        description: 'Provides loans up to Rs.10 lakh to non-corporate, non-farm small/micro-enterprises.',
        highlight: 'Easy access to credit without collateral for small businesses.',
        benefits: [
            { title: 'Loan Facility', description: 'Loans up to Rs.10 lakh under three categories: Shishu, Kishore, and Tarun.' },
            { title: 'No Collateral', description: 'No collateral required for loans up to a certain limit.' }
        ],
        applicationStages: [
            { name: 'applicationSubmittedStage', icon: Send },
            { name: 'loanSanction', icon: Gavel },
            { name: 'loanDisbursal', icon: CircleDollarSign },
        ],
        checklist: [
            { text: 'submitApplication', status: 'upcoming' },
            { text: 'documentVerification', status: 'upcoming' },
            { text: 'loanAmountDisbursed', status: 'upcoming' },
        ],
        requiredDocuments: mudraYojanaDocuments,
        aiScore: 95,
        eligibilityMatch: 98,
        benefitPotential: 85,
        successProbability: 92,
        immediateActions: [
            'Decide loan category (Shishu, Kishore, Tarun)',
            'Approach a bank or MFI',
        ],
        timeline: '7-10 working days',
        riskFactors: ['Loan amount may be small', 'Interest rates vary'],
        portal: 'https://www.mudra.org.in/',
    },
    {
        id: 'stand-up-india',
        name: 'Stand-Up India',
        description: 'Facilitates bank loans between Rs.10 lakh and Rs.1 crore to SC/ST and women borrowers.',
        highlight: 'Promotes entrepreneurship among women and SC/ST communities.',
        benefits: [
            { title: 'Significant Loan Amount', description: 'Bank loans from Rs.10 lakh to Rs.1 Crore for greenfield enterprises.' },
            { title: 'Inclusive', description: 'Specifically for enterprises in manufacturing, services or the trading sector, setup by SC/ST/Women entrepreneurs.' }
        ],
        applicationStages: [
             { name: 'applicationSubmittedStage', icon: Send },
            { name: 'loanSanction', icon: Gavel },
            { name: 'loanDisbursal', icon: CircleDollarSign },
        ],
        checklist: [
            { text: 'submitApplication', status: 'upcoming' },
            { text: 'documentVerification', status: 'upcoming' },
            { text: 'loanAmountDisbursed', status: 'upcoming' },
        ],
        requiredDocuments: standUpIndiaDocuments,
        aiScore: 85,
        eligibilityMatch: 90,
        benefitPotential: 80,
        successProbability: 75,
        immediateActions: [
            'Check eligibility criteria',
            'Prepare detailed project report',
        ],
        timeline: '4-6 weeks',
        riskFactors: ['Requires collateral', 'Longer processing time'],
        portal: 'https://www.standupmitra.in/',
    },
    {
        id: 'sfurti',
        name: 'Scheme of Fund for Regeneration of Traditional Industries (SFURTI)',
        description: 'To make traditional industries more productive, profitable and capable for generating sustained employment for rural artisans.',
        highlight: 'Supports cluster-based development to improve infrastructure and skills.',
        benefits: sfurtiBenefits,
        applicationStages: applicationStages,
        checklist: initialChecklist,
        requiredDocuments: sfurtiDocuments,
        aiScore: 82,
        eligibilityMatch: 85,
        benefitPotential: 80,
        successProbability: 78,
        immediateActions: [
            'Form a cluster of at least 50 artisans',
            'Submit a proposal to the Nodal Agency',
        ],
        timeline: '3-6 months',
        riskFactors: ['Cluster formation can be complex', 'Lengthy approval process'],
        portal: 'https://sfurti.msme.gov.in/',
    },
    {
        id: 'ahvy',
        name: 'Ambedkar Hastshilp Vikas Yojana (AHVY)',
        description: 'A comprehensive scheme for the development of handicrafts, empowering artisans through training, design, and marketing support.',
        highlight: 'Focuses on the holistic development of artisans in identified clusters.',
        benefits: ahvyBenefits,
        applicationStages: applicationStages,
        checklist: initialChecklist,
        requiredDocuments: ahvyDocuments,
        aiScore: 78,
        eligibilityMatch: 80,
        benefitPotential: 75,
        successProbability: 72,
        immediateActions: [
            'Join a Self-Help Group (SHG) of artisans',
            'Apply for training programs',
        ],
        timeline: 'Varies by component',
        riskFactors: ['Benefits are often group-based', 'Limited individual support'],
        portal: 'https://handicrafts.nic.in/',
    },
    {
        id: 'pmegp',
        name: 'Prime Minister Employment Generation Programme (PMEGP)',
        description: 'Credit-linked subsidy program for generating self-employment through micro-enterprises in the non-farm sector.',
        highlight: 'Provides subsidies and loans to set up new micro-enterprises.',
        benefits: pmegpBenefits,
        applicationStages: applicationStages,
        checklist: initialChecklist,
        requiredDocuments: pmegpDocuments,
        aiScore: 88,
        eligibilityMatch: 92,
        benefitPotential: 85,
        successProbability: 85,
        immediateActions: [
            'Prepare a project report',
            'Apply online through the PMEGP portal',
        ],
        timeline: '2-3 months',
        riskFactors: ['High number of applications', 'Subsidy is released after loan disbursement'],
        portal: 'https://www.kviconline.gov.in/pmegp/',
    },
    {
        id: 'skill-india',
        name: 'Skill India Mission - Artisan Training',
        description: 'Provides skill development and training to the country’s youth, with several programs specifically for artisans.',
        highlight: 'Offers certified training in various crafts to improve employability.',
        benefits: skillIndiaBenefits,
        applicationStages: applicationStages,
        checklist: initialChecklist,
        requiredDocuments: skillIndiaDocuments,
        aiScore: 75,
        eligibilityMatch: 90,
        benefitPotential: 70,
        successProbability: 80,
        immediateActions: [
            'Find a relevant training program',
            'Enroll at a local training center',
        ],
        timeline: 'Varies by course',
        riskFactors: ['Training quality can vary', 'Job placement is not guaranteed'],
        portal: 'https://www.skillindia.gov.in/',
    },
    {
        id: 'cgtmse',
        name: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
        description: 'Provides credit guarantees to financial institutions for collateral-free loans to micro and small enterprises (MSEs).',
        highlight: 'Enables collateral-free loans by providing a credit guarantee to lenders.',
        benefits: cgtmseBenefits,
        applicationStages: applicationStages,
        checklist: initialChecklist,
        requiredDocuments: cgtmseDocuments,
        aiScore: 86,
        eligibilityMatch: 88,
        benefitPotential: 85,
        successProbability: 82,
        immediateActions: [
            'Prepare a viable business plan',
            'Approach a bank for a loan under the CGTMSE scheme',
        ],
        timeline: '1-2 months',
        riskFactors: ['Bank’s internal credit policy still applies', 'Guarantee is for the lender, not the borrower'],
        portal: 'https://www.cgtmse.in/',
    },
]

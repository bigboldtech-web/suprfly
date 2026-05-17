export const PLAN_LIMITS = {
  FREE:     { accounts: 1, workflowsPerAccount: 1, keywordsPerWorkflow: 3,  creatorsPerWorkflow: 5,   commentsDayPerAccount: 25,  commentsDayGlobal: 25  },
  STARTER:  { accounts: 1, workflowsPerAccount: 2, keywordsPerWorkflow: 5,  creatorsPerWorkflow: 20,  commentsDayPerAccount: 50,  commentsDayGlobal: 50  },
  GROWTH:   { accounts: 2, workflowsPerAccount: 3, keywordsPerWorkflow: 5,  creatorsPerWorkflow: 20,  commentsDayPerAccount: 50,  commentsDayGlobal: 150 },
  AGENCY:   { accounts: 5, workflowsPerAccount: 4, keywordsPerWorkflow: 5,  creatorsPerWorkflow: 20,  commentsDayPerAccount: 50,  commentsDayGlobal: 250 },
  LIFETIME: { accounts: 3, workflowsPerAccount: 3, keywordsPerWorkflow: 5,  creatorsPerWorkflow: 20,  commentsDayPerAccount: 50,  commentsDayGlobal: 150 },
};

export const RATE_LIMITS = {
  linkedin: {
    maxCommentsPerDay: 150,
    maxCommentsPerHour: 20,
    minDelaySeconds: 60,
    maxDelaySeconds: 300,
    activeHoursStart: 9,
    activeHoursEnd: 18,
    commentWithinMinutes: 30,
  },
  twitter: {
    maxCommentsPerDay: 200,
    maxCommentsPerHour: 25,
    minDelaySeconds: 30,
    maxDelaySeconds: 180,
    activeHoursStart: 8,
    activeHoursEnd: 22,
    commentWithinMinutes: 60,
  },
};

export const SENSITIVE_TOPICS = [
  'politics', 'election', 'political party', 'vote', 'government scandal',
  'racism', 'discrimination', 'hate speech', 'xenophobia', 'casteism',
  'death', 'tragedy', 'shooting', 'bombing', 'terror', 'war', 'massacre',
  'religion', 'religious conflict', 'communal',
  'sexual', 'nsfw', 'explicit', 'pornography',
  'suicide', 'self-harm',
  'drugs', 'narcotics',
  'genocide', 'ethnic cleansing',
];

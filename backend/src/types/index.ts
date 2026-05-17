import { Plan } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  plan: Plan;
  isActive: boolean;
  maxAccounts: number;
  maxWorkflowsPerAccount: number;
  maxKeywordsPerWorkflow: number;
  maxCreatorsPerWorkflow: number;
  maxCommentsDayPerAccount: number;
  maxCommentsDayGlobal: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

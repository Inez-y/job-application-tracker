import type { ApplicationStatus } from "./jobApplication";

export type RecentApplication = {
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type UpcomingDeadline = {
  id: string;
  companyName: string;
  jobTitle: string;
  deadline: string | null;
};

export type ApplicationTrendResponse = {
  month: string;
  count: number;
};

export type ApplicationSourceCount = {
  source: string;
  count: number;
};

export type ApplicationConversionRate = {
  fromStatus: number;
  toStatus: number;
  label: string;
  fromCount: number;
  toCount: number;
  rate: number;
};

export type DashboardStats = {
  totalApplications: number;
  wishlistCount: number;
  appliedCount: number;
  onlineAssessmentCount: number;
  interviewingCount: number;
  offerCount: number;
  rejectedCount: number;
  withdrawnCount: number;
  upcomingDeadlineCount: number;
  completedReminderCount: number;
  pendingReminderCount: number;
  recentApplications: RecentApplication[];
  upcomingDeadlines: UpcomingDeadline[];
  applicationTrend: ApplicationTrendResponse[];
  applicationSourceCounts: ApplicationSourceCount[];
  conversionRates: ApplicationConversionRate[];
};

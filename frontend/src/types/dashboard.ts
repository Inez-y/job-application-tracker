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
};


export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ApplicationStatus =
  | 0 // Wishlist
  | 1 // Applied
  | 2 // OnlineAssessment
  | 3 // Interviewing
  | 4 // Offer
  | 5 // Rejected
  | 6; // Withdrawn

export type ApplicationSource = 
  | 0 // LinkedIn
  | 1 // Indeed
  | 2 // CompanyWebsite
  | 3 // Referral
  | 4 // Recruiter
  | 5 // Handshake
  | 6; // Other

export type JobApplication = {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string | null;
  jobUrl: string | null;
  status: ApplicationStatus;
  dateApplied: string | null;
  deadline: string | null;
  salaryRange: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  source: ApplicationSource;
};

export type CreateJobApplicationRequest = {
  companyName: string;
  jobTitle: string;
  location?: string | null;
  jobUrl?: string | null;
  status: ApplicationStatus;
  dateApplied?: string | null;
  deadline?: string | null;
  salaryRange?: string | null;
  notes?: string | null;
  source: ApplicationSource;
};

export type UpdateJobApplicationRequest = {
  companyName: string;
  jobTitle: string;
  location?: string | null;
  jobUrl?: string | null;
  status: ApplicationStatus;
  dateApplied?: string | null;
  deadline?: string | null;
  salaryRange?: string | null;
  notes?: string | null;
  source: ApplicationSource;
};

export type ApplicationStatusHistory = {
  id: string;
  jobApplicationId: string;
  oldStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedAt: string;
};

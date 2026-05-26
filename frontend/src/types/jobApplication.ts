export type ApplicationStatus =
  | 0 // Wishlist
  | 1 // Applied
  | 2 // OnlineAssessment
  | 3 // Interviewing
  | 4 // Offer
  | 5 // Rejected
  | 6; // Withdrawn

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
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type InterviewType =
  | 0 // PhoneScreen
  | 1 // Technical
  | 2 // Behavioral
  | 3 // FinalRound
  | 4 // Onsite
  | 5; // Other

export type Interview = {
  id: string;
  jobApplicationId: string;
  title: string;
  type: InterviewType;
  scheduledAt: string;
  durationMinutes: number;
  interviewerName: string | null;
  meetingLink: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInterviewRequest = {
  title: string;
  type: InterviewType;
  scheduledAt: string;
  durationMinutes: number;
  interviewerName?: string | null;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
};

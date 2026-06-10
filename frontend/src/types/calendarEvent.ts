export type CalendarEventType = "Interview" | "Reminder";

export type CalendarEvent = {
  id: string;
  jobApplicationId: string;
  title: string;
  companyName: string;
  jobTitle: string;
  startsAt: string;
  endsAt: string | null;
  type: CalendarEventType;
};

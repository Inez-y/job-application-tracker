import type { ReminderType } from "./reminder";

export type UpcomingReminder = {
  id: string;
  jobApplicationId: string;
  companyName: string;
  jobTitle: string;
  title: string;
  type: ReminderType;
  remindAt: string;
  isCompleted: boolean;
};

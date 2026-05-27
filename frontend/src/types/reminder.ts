export type ReminderType =
  | 0 // FollowUp
  | 1 // Deadline
  | 2 // Interview
  | 3 // TakeHomeAssignment
  | 4; // Other

export type Reminder = {
  id: string;
  jobApplicationId: string;
  title: string;
  type: ReminderType;
  remindAt: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateReminderRequest = {
  title: string;
  type: ReminderType;
  remindAt: string;
};

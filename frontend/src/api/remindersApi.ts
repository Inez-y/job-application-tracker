import { axiosClient } from "./axiosClient";
import type { CreateReminderRequest, Reminder } from "../types/reminder";

export async function getReminders(jobApplicationId: string
): Promise<Reminder[]> {
  const response = await axiosClient.get<Reminder[]>(
    `/api/job-applications/${jobApplicationId}/reminders`
  );

  return response.data;
}

export async function createReminder(
    jobApplicationId: string,
    request: CreateReminderRequest
): Promise<Reminder> {
  const response = await axiosClient.post<Reminder>(
    `/api/job-applications/${jobApplicationId}/reminders`,
    request
    );

    return response.data;
}

export async function updateReminder(
  jobApplicationId: string,
  reminderId: string,
  request: CreateReminderRequest
): Promise<Reminder> {
  const response = await axiosClient.put<Reminder>(
    `/api/job-applications/${jobApplicationId}/reminders/${reminderId}`,
    request
  );

  return response.data;
}

export async function markReminderComplete(
    jobApplicationId: string,
    reminderId: string
): Promise<Reminder> {
  const response = await axiosClient.patch<Reminder>(
    `/api/job-applications/${jobApplicationId}/reminders/${reminderId}/complete`
  );

  return response.data;
}

export async function markReminderIncomplete(
    jobApplicationId: string,
    reminderId: string
): Promise<Reminder> {
  const response = await axiosClient.patch<Reminder>(
    `/api/job-applications/${jobApplicationId}/reminders/${reminderId}/incomplete`
  );

  return response.data;
}

export async function deleteReminder(
  jobApplicationId: string,
  reminderId: string
): Promise<void> {
  await axiosClient.delete(
    `/api/job-applications/${jobApplicationId}/reminders/${reminderId}`
  );
}

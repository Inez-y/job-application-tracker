import { axiosClient } from "./axiosClient";
import type { DashboardStats } from "../types/dashboard";
import type { UpcomingReminder } from "../types/upcomingReminder";

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await axiosClient.get<DashboardStats>("/api/dashboard/stats");
  return response.data;
}

export async function getUpcomingReminders(days = 7): Promise<UpcomingReminder[]> {
  const response = await axiosClient.get<UpcomingReminder[]>(
    `/api/reminders/upcoming?days=${days}`
  );

  return response.data;
}

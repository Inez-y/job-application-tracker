import { axiosClient } from "./axiosClient";
import type { CalendarEvent } from "../types/calendarEvent";

export async function getCalendarEvents(
  start: string,
  end: string
): Promise<CalendarEvent[]> {
  const response = await axiosClient.get<CalendarEvent[]>(
    `/api/calendar/events?start=${start}&end=${end}`
  );

  return response.data;
}

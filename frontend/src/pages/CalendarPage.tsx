import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { getCalendarEvents } from "../api/calendarApi";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMonthRange(date: Date) {
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59));

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function formatMonth(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CalendarPage() {
const [currentMonth, setCurrentMonth] = useState(() => new Date());
const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
const range = useMemo(() => getMonthRange(currentMonth), [currentMonth]);

const { data, isLoading, isError } = useQuery({
    queryKey: ["calendarEvents", range.start, range.end],
    queryFn: () => getCalendarEvents(range.start, range.end),
});

const groupedEvents = useMemo(() => {
    const events = data ?? [];

    return events.reduce<Record<string, typeof events>>((groups, event) => {
    const key = toDateInputValue(new Date(event.startsAt));

    if (!groups[key]) {
        groups[key] = [];
    }

    groups[key].push(event);

    return groups;
    }, {});
}, [data]);

function goToPreviousMonth() {
    setCurrentMonth(
    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
}

function goToNextMonth() {
    setCurrentMonth(
    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
}

    const monthOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    ];

    const currentYear = new Date().getFullYear();

    const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);

    function handleMonthChange(monthIndex: number) {
    setCurrentMonth(
        (current) => new Date(current.getFullYear(), monthIndex, 1)
    );
    }

    function handleYearChange(year: number) {
    setCurrentMonth(
        (current) => new Date(year, current.getMonth(), 1)
    );
    }

return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
    <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Calendar
            </h1>

            <p className="mt-2 text-slate-600">
            View upcoming interviews and reminders in one place.
            </p>
        </div>

        <div className="relative flex items-center justify-between gap-3">
            <button
                type="button"
                onClick={goToPreviousMonth}
                className="text-sm font-medium text-slate-700 hover:text-slate-950"
            >
                ← Previous
            </button>

            <div className="relative">
                <button
                type="button"
                onClick={() => setIsMonthPickerOpen((current) => !current)}
                className="rounded-lg px-3 py-2 text-lg font-semibold text-slate-900 hover:bg-slate-200"
                aria-expanded={isMonthPickerOpen}
                aria-controls="month-picker"
                >
                <span>{formatMonth(currentMonth)}</span>
                <span className="text-sm text-slate-700" aria-hidden="true">
                    {isMonthPickerOpen ? " ▲ " : " ▼ "}
                </span>
                </button>

                {isMonthPickerOpen && (
                <div
                    id="month-picker"
                    className="absolute left-1/2 top-12 z-50 w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
                >
                    <div className="grid grid-cols-3 gap-2">
                    {monthOptions.map((month, index) => (
                        <button
                        key={month}
                        type="button"
                        onClick={() => handleMonthChange(index)}
                        className={`rounded-lg px-3 py-2 text-sm ${
                            currentMonth.getMonth() === index
                            ? "bg-slate-900 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                        >
                        {month.slice(0, 3)}
                        </button>
                    ))}
                    </div>

                    <div className="mt-4">
                    <label
                        htmlFor="calendarYear"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Year
                    </label>

                    <select
                        id="calendarYear"
                        value={currentMonth.getFullYear()}
                        onChange={(event) => handleYearChange(Number(event.target.value))}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    >
                        {yearOptions.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                        ))}
                    </select>
                    </div>

                    <button
                    type="button"
                    onClick={() => setIsMonthPickerOpen(false)}
                    className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                    Done
                    </button>
                </div>
                )}
            </div>

            <button
                type="button"
                onClick={goToNextMonth}
                className="text-sm font-medium text-slate-700 hover:text-slate-950"
            >
                Next →
            </button>
            </div>
        </div>

        {isLoading && (
        <Card>
            <p className="text-slate-600">Loading calendar...</p>
        </Card>
        )}

        {isError && (
        <Card>
            <p className="text-red-600">Failed to load calendar.</p>
        </Card>
        )}

        {!isLoading && !isError && Object.keys(groupedEvents).length === 0 && (
        <Card>
            <p className="text-slate-600">
            No interviews or reminders this month.
            </p>
        </Card>
        )}

        {!isLoading &&
        !isError &&
        Object.entries(groupedEvents).map(([day, events]) => (
            <Card key={day}>
            <h2 className="text-lg font-semibold text-slate-900">
                {formatDay(day)}
            </h2>

            <div className="mt-4 space-y-3">
                {events.map((event) => (
                <Link
                    key={`${event.type}-${event.id}`}
                    to={`/applications/${event.jobApplicationId}`}
                    className="block rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100"
                >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="font-semibold text-slate-900">
                        {event.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                        {event.companyName} · {event.jobTitle}
                        </p>
                    </div>

                    <div className="text-sm sm:text-right">
                        <p className="font-medium text-slate-900">
                        {event.type}
                        </p>

                        <p className="text-slate-500">
                        {formatTime(event.startsAt)}
                        </p>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
            </Card>
        ))}
    </div>
    </main>
);
}

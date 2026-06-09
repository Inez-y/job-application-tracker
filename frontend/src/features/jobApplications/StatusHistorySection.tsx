import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteStatusHistory,
  getStatusHistory,
  updateStatusHistory,
} from "../../api/jobApplicationsApi";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatDate } from "../../utils/dateFormat";
import type { ApplicationStatus } from "../../types/jobApplication";

type Props = {
  jobApplicationId: string;
};

const statusLabels: Record<ApplicationStatus, string> = {
  0: "Wishlist",
  1: "Applied",
  2: "Online Assessment",
  3: "Interviewing",
  4: "Offer",
  5: "Rejected",
  6: "Withdrawn",
};

export function StatusHistorySection({ jobApplicationId }: Props) {
  const queryClient = useQueryClient();

  const [historyIdToDelete, setHistoryIdToDelete] = useState<string | null>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [oldStatus, setOldStatus] = useState<ApplicationStatus>(0);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>(1);
  const [changedAt, setChangedAt] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["statusHistory", jobApplicationId],
    queryFn: () => getStatusHistory(jobApplicationId),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingHistoryId) {
        throw new Error("No status history selected.");
      }

      return updateStatusHistory(jobApplicationId, editingHistoryId, {
        oldStatus,
        newStatus,
        changedAt: new Date(changedAt).toISOString(),
      });
    },
    onSuccess: () => {
      setEditingHistoryId(null);
      queryClient.invalidateQueries({
        queryKey: ["statusHistory", jobApplicationId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (historyId: string) =>
      deleteStatusHistory(jobApplicationId, historyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["statusHistory", jobApplicationId],
      });
      setHistoryIdToDelete(null);
    },
  });

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Status History</h2>

      {editingHistoryId && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateMutation.mutate();
          }}
          className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="oldStatus" className="block text-sm font-medium text-slate-700">
                Old Status
              </label>
              <select
                id="oldStatus"
                value={oldStatus}
                onChange={(event) =>
                  setOldStatus(Number(event.target.value) as ApplicationStatus)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="newStatus" className="block text-sm font-medium text-slate-700">
                New Status
              </label>
              <select
                id="newStatus"
                value={newStatus}
                onChange={(event) =>
                  setNewStatus(Number(event.target.value) as ApplicationStatus)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="changedAt" className="block text-sm font-medium text-slate-700">
                Changed At
              </label>
              <input
                id="changedAt"
                type="date"
                value={changedAt}
                onChange={(event) => setChangedAt(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingHistoryId(null)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}

      {isLoading && (
        <p className="mt-2 text-slate-600">Loading status history...</p>
      )}

      {isError && (
        <p className="mt-2 text-red-600">Failed to load status history.</p>
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <p className="mt-2 text-slate-600">No status changes yet.</p>
      )}

      {data && data.length > 0 && (
        <div className="mt-4 space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">
                    {statusLabels[item.oldStatus]} → {statusLabels[item.newStatus]}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDate(item.changedAt)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingHistoryId(item.id);
                      setOldStatus(item.oldStatus);
                      setNewStatus(item.newStatus);
                      setChangedAt(item.changedAt.slice(0, 10));
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setHistoryIdToDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(historyIdToDelete)}
        title="Delete status history?"
        description="This will permanently delete this status history record. This action cannot be undone."
        confirmLabel="Delete status"
        isLoading={deleteMutation.isPending}
        onCancel={() => setHistoryIdToDelete(null)}
        onConfirm={() => {
          if (!historyIdToDelete) {
            return;
          }

          deleteMutation.mutate(historyIdToDelete);
        }}
      />
    </section>
  );
}

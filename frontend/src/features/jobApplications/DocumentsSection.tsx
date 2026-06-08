import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteDocument,
  downloadDocument,
  getDocuments,
  uploadDocument,
} from "../../api/documentsApi";
import type { DocumentType } from "../../types/document";

type Props = { jobApplicationId: string; };

const documentTypeLabels: Record<number, string> = {
    0: "Resume",
    1: "Cover Letter",
    2: "Job Description",
    3: "Take-home Assignment",
    4: "Other",
};

function formatFileSize(sizeBytes: number) {
    if (sizeBytes < 1024) {
        return `${sizeBytes} B`;
    }

    if (sizeBytes < 1024 * 1024) {
        return `${(sizeBytes / 1024).toFixed(1)} KB`;
    }

    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsSection({ jobApplicationId }: Props) {
    const queryClient = useQueryClient();

    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<DocumentType>(0);
    const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["documents", jobApplicationId],
    queryFn: () => getDocuments(jobApplicationId),
  });

  const invalidateDocuments = () => {
    queryClient.invalidateQueries({
        queryKey: ["documents", jobApplicationId],
    });
  };

  const uploadMutation = useMutation({
    mutationFn: () => {
        if (!file) {
        throw new Error("File is required.");
        }

        return uploadDocument(jobApplicationId, file, type);
    },
    onSuccess: () => {
        setFile(null);
        setType(0);
        setError(null);
        invalidateDocuments();
    },
    onError: () => {
        setError("Failed to upload document.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) =>
        deleteDocument(jobApplicationId, documentId),
    onSuccess: invalidateDocuments,
  });

  async function handleDownload(documentId: string, fileName: string) {
    try {
        const blob = await downloadDocument(jobApplicationId, documentId);

        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement("a");

        link.href = url;
        link.download = fileName;
        link.click();

        window.URL.revokeObjectURL(url);
    } catch {
        setError("Failed to download document.");
    }
  }

  return (
    <section className="">
      <h2 className="text-lg font-semibold text-slate-900"> Documents </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (!file) {
            setError("Please choose a file.");
            return;
          }

          uploadMutation.mutate();
        }}
        className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium"> Document Type </label>
            <select
              value={type}
              onChange={(event) =>
                setType(Number(event.target.value) as DocumentType)
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value={0}> Resume </option>
              <option value={1}> Cover Letter </option>
              <option value={2}> Job Description </option>
              <option value={3}> Take-home Assignment </option>
              <option value={4}> Other </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium"> File </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError(null);
              }}
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={uploadMutation.isPending || !file}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {isLoading && <p className="mt-4 text-slate-600"> Loading documents... </p>}

      {isError && <p className="mt-4 text-red-600"> Failed to load documents. </p>}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <p className="mt-4 text-slate-600"> No documents uploaded yet. </p>
      )}

      {data && data.length > 0 && (
        <div className="mt-4 space-y-3">
          {data.map((document) => (
            <div
              key={document.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {document.originalFileName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {documentTypeLabels[document.type]} ·{" "}
                    {formatFileSize(document.sizeBytes)} · Uploaded{" "}
                    {new Date(document.uploadedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(document.id, document.originalFileName)
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(document.id)}
                    disabled={deleteMutation.isPending}
                    className="text-sm text-red-600 hover:underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

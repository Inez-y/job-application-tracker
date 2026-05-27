export type DocumentType =
  | 0 // Resume
  | 1 // CoverLetter
  | 2 // JobDescription
  | 3 // TakeHomeAssignment
  | 4; // Other

export type Document = {
  id: string;
  jobApplicationId: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  type: DocumentType;
  uploadedAt: string;
};

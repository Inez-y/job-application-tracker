export type ApplicationNote = {
  id: string;
  jobApplicationId: string;
  content: string;
  createdAt: string;
};

export type CreateApplicationNoteRequest = {
  content: string;
};

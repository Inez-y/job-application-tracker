export type EmailTemplateType =
  | 0 // FollowUp
  | 1 // ThankYou
  | 2 // RecruiterOutreach
  | 3 // InterviewConfirmation
  | 4 // Withdrawal
  | 5; // Other

export type EmailTemplate = {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmailTemplateRequest = {
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
};

export type PreviewEmailTemplateResponse = {
  subject: string;
  body: string;
};

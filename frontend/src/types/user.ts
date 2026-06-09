export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type UpdateUserProfileRequest = {
  firstName: string;
  lastName: string;
  email: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

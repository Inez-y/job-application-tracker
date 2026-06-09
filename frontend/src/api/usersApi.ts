import { axiosClient } from "./axiosClient";
import type {
  UpdateUserProfileRequest,
  ChangePasswordRequest,
  UserProfile,
} from "../types/user";

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const response = await axiosClient.get<UserProfile>("/api/users/me");

  return response.data;
}

export async function updateCurrentUserProfile(
  request: UpdateUserProfileRequest
): Promise<void> {
  await axiosClient.put("/api/users/me", request);
}

export async function changeCurrentUserPassword(
  request: ChangePasswordRequest
): Promise<void> {
  await axiosClient.put("/api/users/me/password", request);
}

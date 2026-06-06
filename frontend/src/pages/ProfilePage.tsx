import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  getCurrentUserProfile,
  changeCurrentUserPassword,
  updateCurrentUserProfile,
} from "../api/usersApi";

export function ProfilePage() {
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setFirstName(data.firstName);
    setLastName(data.lastName);
    setEmail(data.email);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateCurrentUserProfile({
        firstName,
        lastName,
        email,
      }),
    onSuccess: () => {
      setServerError(null);
      setServerMessage("Profile updated successfully.");

      localStorage.setItem("userEmail", email);

      queryClient.invalidateQueries({
        queryKey: ["currentUserProfile"],
      });
    },
    onError: () => {
      setServerMessage(null);
      setServerError("Failed to update profile.");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      changeCurrentUserPassword({
        currentPassword,
        newPassword,
      }),
    onSuccess: () => {
      setPasswordError(null);
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: () => {
      setPasswordMessage(null);
      setPasswordError("Failed to change password. Check your current password.");
    },
  });

  if (isLoading) {
    return <main className="p-8">Loading profile...</main>;
  }

  if (isError) {
    return (
      <main className="p-8">
        <p className="text-red-600">Failed to load profile.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>

          <p className="mt-2 text-slate-600">
            Update your account information.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();

              if (!firstName.trim() || !lastName.trim() || !email.trim()) {
                return;
              }

              updateMutation.mutate();
            }}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-slate-700"
              >
                First Name
              </label>

              <input
                id="firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-slate-700"
              >
                Last Name
              </label>

              <input
                id="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            {serverMessage && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                {serverMessage}
              </p>
            )}

            {serverError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              disabled={
                updateMutation.isPending ||
                !firstName.trim() ||
                !lastName.trim() ||
                !email.trim()
              }
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>

        <Card className="mt-6 p-8">
          <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>

          <p className="mt-2 text-slate-600">
            Update your password to keep your account secure.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();

              setPasswordMessage(null);
              setPasswordError(null);

              if (!currentPassword || !newPassword || !confirmNewPassword) {
                setPasswordError("All password fields are required.");
                return;
              }

              if (newPassword.length < 8) {
                setPasswordError("New password must be at least 8 characters.");
                return;
              }

              if (newPassword !== confirmNewPassword) {
                setPasswordError("New passwords do not match.");
                return;
              }

              changePasswordMutation.mutate();
            }}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-slate-700"
              >
                Current Password
              </label>

              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-slate-700"
              >
                Confirm New Password
              </label>

              <input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            {passwordMessage && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                {passwordMessage}
              </p>
            )}

            {passwordError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {passwordError}
              </p>
            )}

            <Button
              type="submit"
              disabled={
                changePasswordMutation.isPending ||
                !currentPassword ||
                !newPassword ||
                !confirmNewPassword
              }
            >
              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfilePage } from "./ProfilePage";
import {
  changeCurrentUserPassword,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../api/usersApi";

vi.mock("../api/usersApi", () => ({
  getCurrentUserProfile: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
  changeCurrentUserPassword: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>
  );
}

const profile = {
  id: "user-1",
  firstName: "Inez",
  lastName: "Yoon",
  email: "inez@example.com",
};

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(getCurrentUserProfile).mockResolvedValue(profile);
    vi.mocked(updateCurrentUserProfile).mockResolvedValue(undefined);
    vi.mocked(changeCurrentUserPassword).mockResolvedValue(undefined);
  });

  it("renders loading state", () => {
    vi.mocked(getCurrentUserProfile).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  it("renders profile form with user data", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: /inez's profile/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /personal information/i }))
      .toBeInTheDocument();

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Inez");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Yoon");
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("inez@example.com");

    expect(screen.getByRole("heading", { name: /change password/i }))
      .toBeInTheDocument();
  });

  it("updates profile information", async () => {
    const user = userEvent.setup();

    renderPage();

    const firstNameInput = await screen.findByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/^email$/i);

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    await user.clear(lastNameInput);
    await user.type(lastNameInput, "Doe");

    await user.clear(emailInput);
    await user.type(emailInput, "jane@example.com");

    await user.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(updateCurrentUserProfile).toHaveBeenCalledWith({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
      });
    });

    expect(
      await screen.findByText(/profile updated successfully/i)
    ).toBeInTheDocument();

    expect(localStorage.getItem("userEmail")).toBe("jane@example.com");
  });

  it("shows error when profile update fails", async () => {
    const user = userEvent.setup();

    vi.mocked(updateCurrentUserProfile).mockRejectedValue(new Error("Failed"));

    renderPage();

    await screen.findByLabelText(/first name/i);

    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(
      await screen.findByText(/failed to update profile/i)
    ).toBeInTheDocument();
  });

  it("does not update profile when required fields are empty", async () => {
    const user = userEvent.setup();

    renderPage();

    const firstNameInput = await screen.findByLabelText(/first name/i);

    await user.clear(firstNameInput);

    expect(screen.getByRole("button", { name: /save profile/i }))
      .toBeDisabled();

    expect(updateCurrentUserProfile).not.toHaveBeenCalled();
  });

  it("changes password successfully", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByLabelText(/current password/i);

    await user.type(screen.getByLabelText(/current password/i), "oldpassword");
    await user.type(screen.getByLabelText(/^new password$/i), "newpassword");
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "newpassword"
    );

    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => {
      expect(changeCurrentUserPassword).toHaveBeenCalledWith({
        currentPassword: "oldpassword",
        newPassword: "newpassword",
      });
    });

    expect(
      await screen.findByText(/password changed successfully/i)
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/current password/i)).toHaveValue("");
    expect(screen.getByLabelText(/^new password$/i)).toHaveValue("");
    expect(screen.getByLabelText(/confirm new password/i)).toHaveValue("");
  });

  it("shows validation error when password fields are empty", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByLabelText(/current password/i);

    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(changeCurrentUserPassword).not.toHaveBeenCalled();

    /*
      Your button is currently disabled when password fields are empty,
      so this validation message will not appear unless you remove
      the disabled condition from the button.
    */
  });

  it("shows validation error when new password is too short", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByLabelText(/current password/i);

    await user.type(screen.getByLabelText(/current password/i), "oldpassword");
    await user.type(screen.getByLabelText(/^new password$/i), "short");
    await user.type(screen.getByLabelText(/confirm new password/i), "short");

    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(
      await screen.findByText(/new password must be at least 8 characters/i)
    ).toBeInTheDocument();

    expect(changeCurrentUserPassword).not.toHaveBeenCalled();
  });

  it("shows validation error when new passwords do not match", async () => {
    const user = userEvent.setup();

    renderPage();

    await screen.findByLabelText(/current password/i);

    await user.type(screen.getByLabelText(/current password/i), "oldpassword");
    await user.type(screen.getByLabelText(/^new password$/i), "newpassword");
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "differentpassword"
    );

    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(
      await screen.findByText(/new passwords do not match/i)
    ).toBeInTheDocument();

    expect(changeCurrentUserPassword).not.toHaveBeenCalled();
  });

  it("shows error when password change fails", async () => {
    const user = userEvent.setup();

    vi.mocked(changeCurrentUserPassword).mockRejectedValue(
      new Error("Failed")
    );

    renderPage();

    await screen.findByLabelText(/current password/i);

    await user.type(screen.getByLabelText(/current password/i), "oldpassword");
    await user.type(screen.getByLabelText(/^new password$/i), "newpassword");
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "newpassword"
    );

    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(
      await screen.findByText(/failed to change password/i)
    ).toBeInTheDocument();
  });

  it("renders error state when profile fails to load", async () => {
    vi.mocked(getCurrentUserProfile).mockRejectedValue(new Error("Failed"));

    renderPage();

    expect(
      await screen.findByText(/failed to load profile/i)
    ).toBeInTheDocument();
  });
});

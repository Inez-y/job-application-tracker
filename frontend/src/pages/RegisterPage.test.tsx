import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "./RegisterPage";

vi.mock("../api/authApi", () => ({
  register: vi.fn(),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the first registration step", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /name/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument();
  });

  it("moves through name, email, password, and review steps", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/first name/i), "example");
    await user.type(screen.getByLabelText(/last name/i), "account");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", { name: /email/i })
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email/i), "example@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", { name: /password/i })
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "Password123!"
    );

    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", { name: /review your account/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/example account/i)).toBeInTheDocument();
    expect(screen.getByText(/example@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/password confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/step 4 of 4/i)).toBeInTheDocument();
  });

  it("shows password when Show button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/first name/i), "example");
    await user.type(screen.getByLabelText(/last name/i), "account");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.type(screen.getByLabelText(/email/i), "example@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(passwordInput, "Password123!");

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getAllByRole("button", { name: /show/i })[0]);

    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getAllByRole("button", { name: /hide/i })[0]);

    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/first name/i), "example");
    await user.type(screen.getByLabelText(/last name/i), "account");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.type(screen.getByLabelText(/email/i), "example@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Wrong123!");

    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument();
  });
});

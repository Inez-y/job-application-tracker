import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders status label", () => {
    render(<StatusBadge status={1} />);

    expect(screen.getByText("Applied")).toBeInTheDocument();
  });

  it("renders interviewing status", () => {
    render(<StatusBadge status={3} />);

    expect(screen.getByText("Interviewing")).toBeInTheDocument();
  });
});

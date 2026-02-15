import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App.jsx";

// Mock socket.io-client
vi.mock("socket.io-client", () => {
  return {
    io: () => ({
      on: (event, callback) => {
        if (event === "sync:tasks") {
          callback([]); // simulate empty tasks sync
        }
      },
      emit: vi.fn(),
      off: vi.fn(),
    }),
  };
});

describe("Kanban", () => {
  it("renders header after loading", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Smart Kanban Board/i)).toBeTruthy();
    });
  });
});

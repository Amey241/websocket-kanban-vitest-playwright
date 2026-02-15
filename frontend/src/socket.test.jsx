import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App.jsx";

// Mock socket.io-client
vi.mock("socket.io-client", () => {
  return {
    io: () => ({
      on: (event, callback) => {
        if (event === "sync:tasks") {
          callback([
            {
              _id: "1",
              title: "Test Task",
              column: "Todo",
              priority: "High",
              category: "Feature",
            },
          ]);
        }
      },
      emit: vi.fn(),
      off: vi.fn(),
    }),
  };
});

describe("WebSocket Integration", () => {
  it("renders tasks after sync", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeTruthy();
    });
  });
});

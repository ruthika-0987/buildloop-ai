import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, readApiJson } from "../lib/api";

describe("API client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports non-JSON backend responses with a deployment hint", async () => {
    const response = new Response("<!doctype html><title>Not Found</title>", {
      status: 404,
      headers: { "content-type": "text/html" },
    });

    await expect(readApiJson(response)).rejects.toThrow(
      "The API returned a non-JSON response (HTTP 404). Check the Vercel /api rewrite or set VITE_API_BASE_URL to the deployed Express backend.",
    );
  });

  it("parses JSON backend responses", async () => {
    const response = new Response(JSON.stringify({ user: null }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });

    await expect(readApiJson(response)).resolves.toEqual({ user: null });
  });

  it("sends API requests with session credentials", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response());

    await apiFetch("/api/auth/me");

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", {
      credentials: "include",
    });
  });
});

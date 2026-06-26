import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import { OcpiResponse } from "../ocpi-request";
import { login } from "./login";
import { mkdir, mkdtemp, readFile, rm, rmdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

describe("The login command", () => {
  test("throws an exception if we pass it a hostname that fails to resolve", async () => {
    mockFetch.mockRejectedValue(new Error("aargh"));

    await expect(
      login("https://example.com/", "whatever-token-abc", "NL-IHO")
    ).rejects.toHaveProperty("message");
  });

  test("creates a session file if we pass it a valid version URL and token", async () => {
    const testOcpiResponse: OcpiResponse<any> = {
      data: {
        version: "2.1.1",
        endpoints: [
          {
            identifier: "locations",
            url: "https://example.org/ocpi/2.1.1/locations",
          },
        ],
      },
      status_code: 1000,
      timestamp: "2022-11-26T09:16:00Z",
    };
    const testResponse: Response = new Response(JSON.stringify(testOcpiResponse), { headers : { "Content-Type": "application/json" } })
    mockFetch.mockResolvedValue(testResponse);

    let tempdir;
    try {
      tempdir = await mkdtemp(path.join(os.tmpdir(), "ocpi-tool-tests-"));
      process.env["HOME"] = tempdir;

      await login(
        "https://example.org/ocpi/2.1.1",
        "whatever-token-abc",
        "NL-IHO"
      );

      await expect(
        readFile(`${process.env.HOME}/.ocpi`, { encoding: "utf-8" })
      ).resolves.toMatch("locations");
    } finally {
      if (tempdir) {
        try {
          await rm(`${tempdir}/.ocpi`);
        } catch {}
        await rmdir(tempdir);
      }
    }
  });
});

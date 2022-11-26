import axios, { AxiosError, AxiosResponse } from "axios";
import { describe, expect, jest, test } from "@jest/globals";
import { OcpiResponse } from "../ocpi-request";
import { login } from "./login";
import { SESSION_FILE } from "../ocpi-request";
import { V211Version } from "../ocpimsgs/version.schema";
import { readFile } from "node:fs/promises";

jest.mock("axios");

const mockXios = axios as jest.Mocked<typeof axios>;

describe("The login command", () => {
  test("throws an exception if we pass it a hostname that fails to resolve", async () => {
    mockXios.mockRejectedValue(new AxiosError("aargh"));

    await expect(login("https://example.com/", "abc")).rejects.toHaveProperty(
      "message"
    );
  });

  test("creates a session file if we pass it a valid version URL and token", async () => {
    const testOcpiResponse: OcpiResponse<V211Version> = {
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
    const testResponse: AxiosResponse = {
      data: testOcpiResponse,
      status: 200,
      statusText: "Ok",
      headers: { "Content-Type": "application/json" },
      config: {},
    };
    mockXios.mockResolvedValue(testResponse);

    await login("https://example.org/ocpi/2.1.1", "abc");

    await expect(
      readFile(SESSION_FILE, { encoding: "utf-8" })
    ).resolves.toMatch("locations");
  });
});

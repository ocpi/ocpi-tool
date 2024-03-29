import axios, { AxiosResponse, AxiosError } from "axios";
import { describe, expect, jest, test } from "@jest/globals";
import {
  OcpiResponse,
  ocpiRequestRetryingAuthTokenBase64,
} from "./ocpi-request";

const mockOcpiResponse: OcpiResponse<{}> = {
  data: [],
  status_code: 1000,
  timestamp: "2022-12-10T17:30:00Z",
};

const mockHttpResponse: AxiosResponse = {
  data: mockOcpiResponse,
  status: 200,
  statusText: "OK",
  headers: { "Content-Type": "application/json" },
  config: {},
};

const mockAuthenticationError: AxiosError = {
  isAxiosError: true,
  toJSON: () => ({}),
  name: "Unauthorized",
  message: "Hoepel op, je mag dit niet zien",
  response: {
    data: {},
    status: 401,
    statusText: "401",
    headers: {},
    config: {},
  },
};

jest.mock("axios");

describe("OCPI request making", () => {
  test("encodes auth token on first try for OCPI 2.2.1", async () => {
    const mockXios = axios as jest.Mocked<typeof axios>;

    const testToken = "tokkietokkietoken";
    const testTokenB64 = Buffer.from(testToken).toString("base64");

    mockXios.mockResolvedValue(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.2.1/nothing/sender",
      testToken,
      "2.2.1"
    );

    const lastAxiosCall = mockXios.mock?.calls?.pop();
    const headersGivenToAxios = lastAxiosCall?.[1]?.headers;
    expect(headersGivenToAxios?.["Authorization"]).toEqual(
      "Token " + testTokenB64
    );
  });

  test("does not encode auth token on first try for OCPI 2.1.1", async () => {
    const mockXios = axios as jest.Mocked<typeof axios>;

    const testToken = "tokkietokkietoken";

    mockXios.mockResolvedValue(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.1.1/nothing/sender",
      testToken,
      "2.1.1"
    );

    const lastAxiosCall = mockXios.mock?.calls?.pop();
    const headersGivenToAxios = lastAxiosCall?.[1]?.headers;
    expect(headersGivenToAxios?.["Authorization"]).toEqual(
      "Token " + testToken
    );
  });

  test("retries encoding the token if a first try for OCPI 2.1.1 fails", async () => {
    const mockXios = axios as jest.Mocked<typeof axios>;

    const testToken = "tokkietokkietoken";
    const testTokenB64 = Buffer.from(testToken).toString("base64");

    mockXios
      .mockRejectedValueOnce(mockAuthenticationError)
      .mockResolvedValueOnce(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.1.1/nothing/sender",
      testToken,
      "2.1.1"
    );

    const firstAxiosCall = mockXios.mock?.calls?.[0];
    const headersGivenToAxiosFirst = firstAxiosCall?.[1]?.headers;
    expect(headersGivenToAxiosFirst?.["Authorization"]).toEqual(
      "Token " + testToken
    );

    const lastAxiosCall = mockXios.mock?.calls?.[1];
    const headersGivenToAxiosSecond = lastAxiosCall?.[1]?.headers;
    expect(headersGivenToAxiosSecond?.["Authorization"]).toEqual(
      "Token " + testTokenB64
    );
  });

  test("includes X-Request-Id and X-Correlation-ID headers in requests", async () => {
    const mockXios = axios as jest.Mocked<typeof axios>;

    const testToken = "tokkietokkietoken";

    mockXios.mockResolvedValueOnce(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.1.1/nothing/sender",
      testToken,
      "2.1.1"
    );

    const axiosCall = mockXios.mock?.calls?.pop();
    const headersGivenToAxios = axiosCall?.[1]?.headers;
    const uuidRegex = /[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}/i;

    expect(headersGivenToAxios?.["X-Request-ID"]).toMatch(uuidRegex);
    expect(headersGivenToAxios?.["X-Correlation-ID"]).toMatch(uuidRegex);
  });

  test("includes routing headers when from and to party are given", async () => {
    const mockXios = axios as jest.Mocked<typeof axios>;

    const testToken = "tokkietokkietoken";

    mockXios.mockResolvedValueOnce(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.2.1/nothing/sender",
      testToken,
      "2.2.1",
      "NLTNM",
      "USCPI"
    );

    const axiosCall = mockXios.mock?.calls?.pop();
    const headersGivenToAxios = axiosCall?.[1]?.headers;
    expect(headersGivenToAxios?.["OCPI-from-country-code"]).toEqual("NL");
    expect(headersGivenToAxios?.["OCPI-from-party-id"]).toEqual("TNM");
    expect(headersGivenToAxios?.["OCPI-to-country-code"]).toEqual("US");
    expect(headersGivenToAxios?.["OCPI-to-party-id"]).toEqual("CPI");
  });
});

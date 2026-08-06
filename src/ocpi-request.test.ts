import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import {
  OcpiResponse,
  ocpiRequestRetryingAuthTokenBase64,
} from "./ocpi-request.js";

const mockOcpiResponse: OcpiResponse<{}> = {
  data: [],
  status_code: 1000,
  timestamp: "2022-12-10T17:30:00Z",
};

const mockHttpResponse: () => Promise<Response> = async () => new Response(JSON.stringify(mockOcpiResponse), { headers: {"Content-Type": "application/json" } })

const mockAuthenticationError: () => Promise<Response> = async () => new Response("Hoepel op, je mag dit niet zien", { status: 401, statusText: "Unauthorized" })

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

describe("OCPI request making", () => {
  test("encodes auth token on first try for OCPI 2.2.1", async () => {
    const testToken = "tokkietokkietoken";
    const testTokenB64 = Buffer.from(testToken).toString("base64");

    mockFetch.mockImplementation(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.2.1/nothing/sender",
      testToken,
      "2.2.1"
    );

    const lastFetchCall = mockFetch.mock?.calls?.pop();
    const headersGivenToFetch = lastFetchCall?.[1]?.headers;
    expect(headersGivenToFetch).toHaveProperty("Authorization",
      "Token " + testTokenB64
    );
  });

  test("does not encode auth token on first try for OCPI 2.1.1", async () => {
    const testToken = "tokkietokkietoken";

    mockFetch.mockImplementation(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.1.1/nothing/sender",
      testToken,
      "2.1.1"
    );

    const lastFetchCall = mockFetch.mock?.calls?.pop();
    const headersGivenToFetch = lastFetchCall?.[1]?.headers;
    expect(headersGivenToFetch).toHaveProperty("Authorization",
      "Token " + testToken
    );
  });

  test("retries encoding the token if a first try for OCPI 2.1.1 fails", async () => {
    const testToken = "tokkietokkietoken";
    const testTokenB64 = Buffer.from(testToken).toString("base64");

    mockFetch
      .mockImplementationOnce(mockAuthenticationError)
      .mockImplementationOnce(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.1.1/nothing/sender",
      testToken,
      "2.1.1"
    );

    const firstFetchCall = mockFetch.mock?.calls?.[0];
    const headersGivenToFetchFirst = firstFetchCall?.[1]?.headers;
    expect(headersGivenToFetchFirst).toHaveProperty(
      "Authorization",
      "Token " + testToken
    );

    const lastFetchCall = mockFetch.mock?.calls?.[1];
    const headersGivenToFetchSecond = lastFetchCall?.[1]?.headers;
    expect(headersGivenToFetchSecond).toHaveProperty(
      "Authorization",
      "Token " + testTokenB64
    );
  });

  test("includes X-Request-Id and X-Correlation-ID headers in requests", async () => {
    const testToken = "tokkietokkietoken";

    mockFetch.mockImplementationOnce(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.1.1/nothing/sender",
      testToken,
      "2.1.1"
    );

    const fetchCall = mockFetch.mock?.calls?.pop();
    const headersGivenToFetch = fetchCall?.[1]?.headers;
    const uuidRegex = /[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}/i;

    expect(headersGivenToFetch).toHaveProperty("X-Request-ID")
    expect(headersGivenToFetch).toHaveProperty("X-Correlation-ID")
  });

  test("includes routing headers when from and to party are given", async () => {
    const testToken = "tokkietokkietoken";

    mockFetch.mockImplementationOnce(mockHttpResponse);

    await ocpiRequestRetryingAuthTokenBase64<{}>(
      "get",
      "http://www.example.com/ocpi/2.2.1/nothing/sender",
      testToken,
      "2.2.1",
      "NLTNM",
      "USCPI"
    );

    const fetchCall = mockFetch.mock?.calls?.pop();
    const headersGivenToFetch = fetchCall?.[1]?.headers;
    expect(headersGivenToFetch).toHaveProperty("OCPI-from-country-code", "NL");
    expect(headersGivenToFetch).toHaveProperty("OCPI-from-party-id", "TNM");
    expect(headersGivenToFetch).toHaveProperty("OCPI-to-country-code", "US");
    expect(headersGivenToFetch).toHaveProperty("OCPI-to-party-id", "CPI");
  });
});

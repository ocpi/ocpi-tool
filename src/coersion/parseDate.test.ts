import { describe, expect, it } from "@jest/globals";
import { InvalidArgumentError } from "commander";
import parseDate from "./parseDate";

describe("Date argument parser", () => {
  it("should coerse ISO 8601 strings to objects", () => {
    const isoDateFrom = "2023-06-29T12:34:56Z";
    const expected = new Date(Date.UTC(2023, 5, 29, 12, 34, 56, 0));

    const parsedDate = parseDate(isoDateFrom)

    expect(parsedDate).toEqual(expected);
  });

  it("should raise an error for invalid values", () => {
    const malformedDateFrom = "2023-06-29T123456Z";
    expect(() => parseDate(malformedDateFrom)).toThrow(InvalidArgumentError);
  });
});
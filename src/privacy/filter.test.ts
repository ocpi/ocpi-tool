import { describe, expect, test } from "@jest/globals";
import { filter, PrivacyDescriptor } from "./filter";

describe("The Client Owned Object Privacy filter", () => {
  test("fills fields with 'na' in the descriptor with '#NA'", () => {
    const descriptor: PrivacyDescriptor = { field: "na" };
    const input = { field: "Jane Doe's political party membership" };

    expect(filter(descriptor, input).result).toEqual({ field: "#NA" });
  });

  test("passes fields' values literally if they're given in the descriptor as 'pass'", () => {
    const descriptor: PrivacyDescriptor = { field: "pass" };
    const input = {
      field:
        "Jane Doe's charging station's connector type that nobody knows belongs to Jane Doe",
    };

    expect(filter(descriptor, input).result).toEqual(input);
  });

  test("applies a filter recursively to all array members when it's given in an array in the descriptor", () => {
    const descriptor: PrivacyDescriptor = { field: [{ nestedField: "na" }] };
    const input = {
      field: [
        { nestedField: "maan" },
        { nestedField: "roos" },
        { nestedField: "vis" },
      ],
    };

    expect(filter(descriptor, input).result).toEqual({
      field: [
        { nestedField: "#NA" },
        { nestedField: "#NA" },
        { nestedField: "#NA" },
      ],
    });
  });

  test("returns an unrecognized property error if it encounters a property not given in the descriptor", () => {
    const descriptor: PrivacyDescriptor = { a: "pass" };
    const input = { b: "whatevs" };

    const error = filter(descriptor, input).errors?.[0];
    expect(error?.name).toEqual("Unrecognized property");
    expect(error).toHaveProperty("message");
  });

  test("returns an unsupported input exception if people try to filter something that isn't like an OCPI client owned object", () => {
    const descriptor: PrivacyDescriptor = {
      a: "pass",
      b: "na",
      c: [{ field: "na" }],
    };

    const results = [
      filter(descriptor, undefined),
      filter(descriptor, 42),
      filter(descriptor, { a: undefined }),
      filter(descriptor, { b: { no: "object-expected-here" } }),
      filter(descriptor, { c: "array-expected-here-but-im-giving-a-string" }),
      filter(descriptor, {
        c: [{ field: undefined }],
      }),
    ];

    console.log(results);

    for (const res of results) {
      expect(res.errors?.[0].name).toEqual("Unsupported input type");
      expect(res.errors?.[0]).toHaveProperty("message");
    }
  });

  test("returns null if null is passed to the input and the descriptor is an object descriptor", () => {
    const descriptor: PrivacyDescriptor = {
      a: "pass",
    };

    expect(filter(descriptor, null).errors).toEqual(null);
    expect(filter(descriptor, null).result).toEqual(null);
  });
});

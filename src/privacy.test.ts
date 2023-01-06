import { describe, expect, test } from "@jest/globals";
import { filter, PrivacyDescriptor } from "./privacy";

describe("The Client Owned Object Privacy filter", () => {
  test("fills fields with 'na' in the schema with '#NA'", () => {
    const schema: PrivacyDescriptor = { field: "na" };
    const input = { field: "Jane Doe's political party membership" };

    expect(filter(schema, input).result).toEqual({ field: "#NA" });
  });

  test("passes fields' values literally if they're given in the schema as 'pass'", () => {
    const schema: PrivacyDescriptor = { field: "pass" };
    const input = {
      field:
        "Jane Doe's charging station's connector type that nobody knows belongs to Jane Doe",
    };

    expect(filter(schema, input).result).toEqual(input);
  });

  test("applies a filter recursively to all array members when it's given in an array in the schema", () => {
    const schema: PrivacyDescriptor = { field: [{ nestedField: "na" }] };
    const input = {
      field: [
        { nestedField: "maan" },
        { nestedField: "roos" },
        { nestedField: "vis" },
      ],
    };

    expect(filter(schema, input).result).toEqual({
      field: [
        { nestedField: "#NA" },
        { nestedField: "#NA" },
        { nestedField: "#NA" },
      ],
    });
  });

  test("returns an unrecognized property error if it encounters a property not given in the schema", () => {
    const schema: PrivacyDescriptor = { a: "pass" };
    const input = { b: "whatevs" };

    const error = filter(schema, input).errors?.[0];
    expect(error?.name).toEqual("Unrecognized property");
    expect(error).toHaveProperty("message");
  });

  test("returns an unsupported input exception if people try to filter something that isn't like an OCPI client owned object", () => {
    const schema: PrivacyDescriptor = {
      a: "pass",
      b: "na",
      c: [{ field: "na" }],
    };

    const results = [
      filter(schema, undefined),
      filter(schema, 42),
      filter(schema, { a: undefined }),
      filter(schema, { b: { no: "object-expected-here" } }),
      filter(schema, { c: "array-expected-here-but-im-giving-a-string" }),
      filter(schema, {
        c: [{ field: undefined }],
      }),
    ];

    console.log(results);

    for (const res of results) {
      expect(res.errors?.[0].name).toEqual("Unsupported input type");
      expect(res.errors?.[0]).toHaveProperty("message");
    }
  });

  test("returns null if null is passed to the input and the schema is an object descriptor", () => {
    const schema: PrivacyDescriptor = {
      a: "pass",
    };

    expect(filter(schema, null).errors).toEqual(null);
    expect(filter(schema, null).result).toEqual(null);
  });
});

import { describe, expect, test } from "@jest/globals";
import { fail } from "assert";
import {
  filter,
  isDescriptorModificationError,
  modifyDescriptorToPass,
  PrivacyDescriptor,
} from "./filter";

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

describe("Client Owned Object Privacy filter modifiers", () => {
  test("can allow all data through", () => {
    const descriptor: PrivacyDescriptor = {
      a: "na",
      b: ["na"],
    };
    const modifier = ".";

    const input = {
      a: "Marie Pietersen",
      b: ["Ergensstraat", "42", "1000 AA", "Amsterdam"],
    };

    const modifiedDescriptor = modifyDescriptorToPass(modifier, descriptor);

    if (isDescriptorModificationError(modifiedDescriptor)) {
      fail();
    } else {
      expect(filter(modifiedDescriptor, input)).toEqual({
        errors: null,
        result: input,
      });
    }
  });

  test("can allow a specific field through", () => {
    const descriptor: PrivacyDescriptor = {
      a: "na",
      b: ["na"],
    };
    const modifier = "a";

    const input = {
      a: "Marie Pietersen",
      b: ["Ergensstraat", "42", "1000 AA", "Amsterdam"],
    };

    const modifiedDescriptor = modifyDescriptorToPass(modifier, descriptor);

    if (isDescriptorModificationError(modifiedDescriptor)) {
      fail();
    } else {
      expect(filter(modifiedDescriptor, input)).toEqual({
        errors: null,
        result: { a: "Marie Pietersen", b: ["#NA", "#NA", "#NA", "#NA"] },
      });
    }
  });

  test("can allow fields through inside arrays", () => {
    const descriptor: PrivacyDescriptor = {
      a: "na",
      b: [
        {
          c: "na",
          d: "na",
        },
      ],
    };

    const modifier = "b.d";

    const input = {
      a: "Marie Pietersen",
      b: [
        { c: "Foo", d: "Bar" },
        { c: "Baz", d: "Quux" },
      ],
    };

    const modifiedDescriptor = modifyDescriptorToPass(modifier, descriptor);

    if (isDescriptorModificationError(modifiedDescriptor)) {
      fail();
    } else {
      expect(filter(modifiedDescriptor, input)).toEqual({
        errors: null,
        result: {
          a: "#NA",
          b: [
            { c: "#NA", d: "Bar" },
            { c: "#NA", d: "Quux" },
          ],
        },
      });
    }
  });

  test("should return an error when trying to modify a nested field under what is a primitive field according to the descriptor", () => {
    const descriptor: PrivacyDescriptor = { a: "na" };

    const modifier = "a.b";

    const modifiedDescriptor = modifyDescriptorToPass(modifier, descriptor);

    expect(isDescriptorModificationError(modifiedDescriptor)).toBeTruthy();
  });

  test("should return an error when it occurs inside an array in the descriptor", () => {
    const descriptor: PrivacyDescriptor = [{ a: "na" }];

    const modifier = "a.b";

    const modifiedDescriptor = modifyDescriptorToPass(modifier, descriptor);

    expect(isDescriptorModificationError(modifiedDescriptor)).toBeTruthy();

    if (isDescriptorModificationError(modifiedDescriptor)) {
      expect(modifiedDescriptor.descriptor).toEqual("na");
      expect(modifiedDescriptor.modifier).toEqual("b");
    }
  });
});

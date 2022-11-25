import { describe, expect, test } from "@jest/globals";
import { doesNotMatch } from "assert";
import { login } from "./login";

describe("The login command", () => {
  test("throws an exception if we pass it a hostname that fails to resolve", async () => {
    await expect(
      login("https://aarghthisdomaindoesnotexistorilleatmyshoe/", "abc")
    ).rejects;
  });
});

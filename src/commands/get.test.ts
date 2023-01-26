import { describe, expect, test } from "@jest/globals";
import { mkdtemp, rmdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { get } from "./get";
import { NOT_LOGGED_IN_ERROR_MESSAGE } from "../ocpi-request";

describe("the get command", () => {
  test("fails when there is no OCPI session file", async () => {
    // let's set the home directory to something where there is no OCPI session file
    let tmpdir;
    try {
      tmpdir = await mkdtemp(path.join(os.tmpdir(), "test-home-dir"));
      process.env.HOME = tmpdir;

      await expect(get("locations")).rejects.toHaveProperty(
        "message",
        NOT_LOGGED_IN_ERROR_MESSAGE
      );
    } finally {
      if (tmpdir) await rmdir(tmpdir);
    }
  });
});

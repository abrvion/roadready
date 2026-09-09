import test from "node:test";
import assert from "node:assert/strict";
import { isValidEmail, normalizeEmail, parsePositiveInt } from "../../server/utils/validators.js";

test("email validation normalizes case and whitespace", () => {
  assert.equal(normalizeEmail("  USER@Example.COM "), "user@example.com");
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
});

test("positive integer parser rejects invalid quantities", () => {
  assert.equal(parsePositiveInt("4"), 4);
  assert.equal(parsePositiveInt("0"), null);
  assert.equal(parsePositiveInt("1.5"), null);
});

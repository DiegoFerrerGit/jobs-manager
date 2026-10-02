import test from "node:test";
import assert from "node:assert";
import { filterJobsBySearch } from "../src/utils/search";
import { JobWithUserState } from "../src/db/schema";

const mockJobs = [
  { id: 1, title: "Engineering Manager", company: "Tech Corp" },
  { id: 2, title: "Software Engineer", company: "Span" },
  { id: 3, title: "Teacher of Spanish", company: "Education Inc" },
  { id: 4, title: "Spanish Translator", company: "Global Lingo" },
  { id: 5, title: "Engine Mechanic", company: "Auto Corp" },
] as JobWithUserState[];

test("Search logic matches by exact company name first", () => {
  // "span" should only return jobs from the company "Span", ignoring "Spanish Translator"
  const result = filterJobsBySearch(mockJobs, "span");
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].company, "Span");
});

test("Search logic falls back to word start match if no exact company match", () => {
  // "spanish" should return jobs with "Spanish" in title or company, but not from "Span"
  const result = filterJobsBySearch(mockJobs, "spanish");
  assert.strictEqual(result.length, 2);
  assert.ok(result.some(j => j.title === "Teacher of Spanish"));
  assert.ok(result.some(j => j.title === "Spanish Translator"));
});

test("Search logic matches by start of word", () => {
  // "eng" matches "Engineering" and "Engineer" and "Engine"
  const result = filterJobsBySearch(mockJobs, "eng");
  assert.strictEqual(result.length, 3);
  assert.ok(result.some(j => j.title === "Engineering Manager"));
  assert.ok(result.some(j => j.title === "Software Engineer"));
  assert.ok(result.some(j => j.title === "Engine Mechanic"));
});

test("Search logic does NOT match mid-word substring", () => {
  // "ngine" should not match "Engineering", "Engineer" or "Engine"
  const result = filterJobsBySearch(mockJobs, "ngine");
  assert.strictEqual(result.length, 0);
});

test("Search logic normalizes accents", () => {
  const jobsWithAccents = [
    { id: 1, title: "Ingeniero de Software", company: "Telefónica" },
    { id: 2, title: "Mánager", company: "Tech" }
  ] as JobWithUserState[];

  // "telefonica" without accents should match "Telefónica"
  const resultCompany = filterJobsBySearch(jobsWithAccents, "telefonica");
  assert.strictEqual(resultCompany.length, 1);
  assert.strictEqual(resultCompany[0].company, "Telefónica");

  // "manager" without accents should match "Mánager"
  const resultTitle = filterJobsBySearch(jobsWithAccents, "manager");
  assert.strictEqual(resultTitle.length, 1);
  assert.strictEqual(resultTitle[0].title, "Mánager");
});

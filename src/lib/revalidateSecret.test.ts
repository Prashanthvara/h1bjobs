import { describe, it, expect } from "vitest";
import { extractSecret } from "./revalidateSecret";

describe("extractSecret", () => {
	it("reads the secret from an Authorization: Bearer header", () => {
		const headers = new Headers({ authorization: "Bearer abc123" });
		expect(extractSecret(headers, null)).toBe("abc123");
	});

	it("is case-insensitive on the Bearer scheme", () => {
		const headers = new Headers({ authorization: "bearer abc123" });
		expect(extractSecret(headers, null)).toBe("abc123");
	});

	it("falls back to the query parameter when no header is present", () => {
		expect(extractSecret(new Headers(), "abc123")).toBe("abc123");
	});

	it("prefers the header over the query parameter", () => {
		const headers = new Headers({ authorization: "Bearer fromheader" });
		expect(extractSecret(headers, "fromquery")).toBe("fromheader");
	});

	it("returns empty string when neither is present", () => {
		expect(extractSecret(new Headers(), null)).toBe("");
	});

	it("ignores a non-Bearer Authorization scheme", () => {
		const headers = new Headers({ authorization: "Basic abc123" });
		expect(extractSecret(headers, null)).toBe("");
	});

	it("trims surrounding whitespace from the bearer token", () => {
		const headers = new Headers({ authorization: "Bearer   abc123  " });
		expect(extractSecret(headers, null)).toBe("abc123");
	});
});

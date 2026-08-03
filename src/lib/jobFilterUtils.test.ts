import { describe, it, expect } from "vitest";
import { getJobLocationOptions } from "./jobFilterUtils";
import type { Job } from "./jobTypes";

const job = (locations: string[]) => ({ location: locations }) as Job;

function findOption(groups: ReturnType<typeof getJobLocationOptions>, value: string) {
    for (const group of groups) {
        const hit = group.options.find((o) => o.value === value);
        if (hit) return hit;
    }
    return undefined;
}

describe("getJobLocationOptions counts", () => {
    it("counts jobs per city", () => {
        const groups = getJobLocationOptions([
            job(["Ann Arbor, MI"]),
            job(["Ann Arbor, MI"]),
            job(["Detroit, MI"]),
        ]);
        expect(findOption(groups, "city:Ann Arbor, MI")?.count).toBe(2);
        expect(findOption(groups, "city:Detroit, MI")?.count).toBe(1);
    });

    it("counts a state as distinct jobs, not the sum of its cities", () => {
        // This job lists two cities in the same state. Summing city counts would
        // report 3 for MI; the union that clicking the state actually produces is 2.
        const groups = getJobLocationOptions([
            job(["Ann Arbor, MI", "Detroit, MI"]),
            job(["Detroit, MI"]),
        ]);
        expect(findOption(groups, "city:Ann Arbor, MI")?.count).toBe(1);
        expect(findOption(groups, "city:Detroit, MI")?.count).toBe(2);
        expect(findOption(groups, "state:MI")?.count).toBe(2);
    });

    it("counts a job once per state even when it lists a non-state location too", () => {
        const groups = getJobLocationOptions([job(["Redwood City, CA", "Remote"])]);
        expect(findOption(groups, "state:CA")?.count).toBe(1);
    });

    it("keeps labels free of the count so the multi-select trigger stays correct", () => {
        const groups = getJobLocationOptions([job(["Ann Arbor, MI"])]);
        expect(findOption(groups, "city:Ann Arbor, MI")?.label).toBe("Ann Arbor, MI");
        expect(findOption(groups, "state:MI")?.label).toBe("Michigan");
    });
});

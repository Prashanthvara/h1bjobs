import { describe, it, expect } from "vitest";
import {
    getJobLocationOptions,
    getDateRangeOptions,
    filterJobsByDateRange,
    getOrgOptions,
    filterJobsByOrg,
} from "./jobFilterUtils";
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

describe("getDateRangeOptions", () => {
    function daysAgo(n: number): string {
        const d = new Date();
        d.setDate(d.getDate() - n);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}`;
    }

    const dated = (date: string) => ({ job_posting_date: date }) as Job;

    it("labels each range with its own result count", () => {
        const options = getDateRangeOptions([
            dated(daysAgo(0)),
            dated(daysAgo(3)),
            dated(daysAgo(20)),
            dated(daysAgo(200)),
        ]);
        const byValue = Object.fromEntries(options.map((o) => [o.value, o.label]));
        expect(byValue["24h"]).toBe("Last 24 hours (1)");
        expect(byValue["7d"]).toBe("Last 7 days (2)");
        expect(byValue["30d"]).toBe("Last 30 days (3)");
    });

    it("returns exactly the three ranges, and no 'Any time' entry", () => {
        expect(getDateRangeOptions([]).map((o) => o.value)).toEqual(["24h", "7d", "30d"]);
    });

    it("counts agree with filterJobsByDateRange for the same input", () => {
        const jobs = [dated(daysAgo(0)), dated(daysAgo(3)), dated(daysAgo(20))];
        for (const value of ["24h", "7d", "30d"] as const) {
            const expected = filterJobsByDateRange(value, jobs).length;
            const label = getDateRangeOptions(jobs).find((o) => o.value === value)!.label;
            expect(label).toContain(`(${expected})`);
        }
    });
});

describe("getOrgOptions", () => {
    const job = (org: string | null) => ({ org }) as Job;

    it("returns one option per employer, with its job count", () => {
        const options = getOrgOptions([job("Stanford University"), job("Stanford University")]);
        expect(options).toEqual([{ value: "Stanford University", label: "Stanford University", count: 2 }]);
    });

    it("merges spelling variants into a single option", () => {
        const options = getOrgOptions([job("Stanford University"), job("stanford university")]);
        expect(options).toHaveLength(1);
        expect(options[0].count).toBe(2);
    });

    it("sorts by count descending, then alphabetically", () => {
        const options = getOrgOptions([
            job("Yale University"),
            job("Stanford University"),
            job("Stanford University"),
            job("Amherst College"),
        ]);
        expect(options.map((o) => o.label)).toEqual([
            "Stanford University",
            "Amherst College",
            "Yale University",
        ]);
    });

    it("skips jobs with no employer", () => {
        expect(getOrgOptions([job(null), job("")])).toEqual([]);
    });
});

describe("filterJobsByOrg", () => {
    const job = (org: string | null) => ({ org }) as Job;

    it("returns every job when no employer is selected", () => {
        const jobs = [job("Stanford University"), job("Yale University")];
        expect(filterJobsByOrg(undefined, jobs)).toHaveLength(2);
    });

    it("keeps only the selected employer", () => {
        const jobs = [job("Stanford University"), job("Yale University")];
        expect(filterJobsByOrg("Stanford University", jobs)).toEqual([jobs[0]]);
    });

    it("matches spelling variants, so the count behind a link is the count on it", () => {
        const jobs = [job("stanford university"), job("The Stanford University"), job("Yale University")];
        expect(filterJobsByOrg("Stanford University", jobs)).toHaveLength(2);
    });

    it("returns nothing for an employer that is not in the feed", () => {
        expect(filterJobsByOrg("Nonexistent College", [job("Yale University")])).toEqual([]);
    });

    it("treats a blank selection as no selection", () => {
        const jobs = [job("Stanford University")];
        expect(filterJobsByOrg("   ", jobs)).toHaveLength(1);
    });
});

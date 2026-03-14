import { Job, JobDateRange } from "./jobTypes";

const stateNameMap: Record<string, string> = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia",
};

export function normalizeJobLocations(location: Job["location"]): string[] {
    if (!location) return [];
    if (Array.isArray(location)) {
        return location.map((loc) => String(loc).trim()).filter(Boolean);
    }
    if (typeof location === "string") {
        return [location.trim()].filter(Boolean);
    }
    return [];
}

export function normalizeJobKeywords(keywords: Job["keywords"]): string[] {
    if (!keywords) return [];
    if (Array.isArray(keywords)) {
        return keywords.map((keyword) => String(keyword).trim()).filter(Boolean);
    }
    if (typeof keywords === "string") {
        return keywords
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean);
    }
    return [];
}

function parseJobDate(value?: string | null) {
    if (!value) return null;

    if (value.includes("T")) {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const parts = value.split("-");
    if (parts.length !== 3) return null;

    const [year, month, day] = parts.map((part) => Number(part));
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getUniqueLocations(jobs: Job[]): string[] {
    const locations = new Set<string>();
    jobs.forEach((job) => {
        normalizeJobLocations(job.location).forEach((loc) => locations.add(loc));
    });
    return Array.from(locations).sort();
}

function getUniqueStates(locations: string[]): string[] {
    const states = new Set<string>();
    locations.forEach((location) => {
        const parts = location.split(",");
        if (parts.length >= 2) {
            const state = parts[parts.length - 1].trim();
            if (state) states.add(state);
        }
    });
    return Array.from(states).sort();
}

export function getJobLocationOptions(jobs: Job[]) {
    const locations = getUniqueLocations(jobs);
    const states = getUniqueStates(locations);

    return states.map((stateCode) => {
        const stateName = stateNameMap[stateCode] || stateCode;
        const citiesInState = locations.filter((location) =>
            location.endsWith(`, ${stateCode}`)
        );

        return {
            label: stateName,
            options: [
                { value: `state:${stateCode}`, label: stateName },
                ...citiesInState.map((city) => ({
                    value: `city:${city}`,
                    label: city,
                })),
            ],
        };
    });
}

export function getKeywordOptions(jobs: Job[]) {
    const keywordCounts = new Map<string, number>();

    jobs.forEach((job) => {
        const keywords = normalizeJobKeywords(job.keywords);
        keywords.forEach((keyword) => {
            keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
        });
    });

    const sortedKeywords = Array.from(keywordCounts.keys()).sort((a, b) => {
        const countDiff = (keywordCounts.get(b) || 0) - (keywordCounts.get(a) || 0);
        if (countDiff !== 0) return countDiff;
        return a.localeCompare(b);
    });

    return sortedKeywords.map((keyword) => ({
        value: keyword,
        label: `${keyword} (${keywordCounts.get(keyword)})`,
    }));
}

export function filterJobsByLocation(selectedValue: string | undefined, jobs: Job[]) {
    if (!selectedValue) return jobs;

    const [type, value] = selectedValue.split(":");

    if (type === "state") {
        return jobs.filter((job) =>
            normalizeJobLocations(job.location).some((loc) => loc.endsWith(`, ${value}`))
        );
    }

    if (type === "city") {
        return jobs.filter((job) =>
            normalizeJobLocations(job.location).some((loc) => loc === value)
        );
    }

    return jobs;
}

export function filterJobsByKeyword(selectedKeyword: string | undefined, jobs: Job[]) {
    if (!selectedKeyword) return jobs;

    return jobs.filter((job) =>
        normalizeJobKeywords(job.keywords).includes(selectedKeyword)
    );
}

export function filterJobsByDateRange(selectedRange: JobDateRange | undefined, jobs: Job[]) {
    if (!selectedRange) return jobs;

    const now = new Date();
    let cutoff: Date;

    if (selectedRange === "24h") {
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else {
        const today = startOfDay(now);
        const daysBack = selectedRange === "7d" ? 6 : 29;
        cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - daysBack);
    }

    return jobs.filter((job) => {
        const jobDate = parseJobDate(job.job_posting_date);
        if (!jobDate) return false;
        return jobDate >= cutoff;
    });
}

export interface SponsoredJob {
    id: string;
    org: string;
    title: string;
    pay: string;
    tags: string[];
    url: string;
    logoUrl: string;
}

// NOTE: constructed referral URLs matching the redirect pattern of the
// activated short link t.mercor.com/Ie5Nv. When per-listing short links are
// activated in the Mercor dashboard (work.mercor.com -> Referrals), swap the
// `url` values here — one-line edits, no component changes.
const MERCOR_REFERRAL_CODE = "6bea186e-1c4c-4d10-b36b-02687e8ceb1d";

function mercorUrl(listingId: string): string {
    return `https://work.mercor.com/jobs/${listingId}?referralCode=${MERCOR_REFERRAL_CODE}&utm_source=referral&utm_medium=direct&utm_campaign=job&utm_content=${listingId}`;
}

// Every Mercor listing carries this exclusion (platform-wide 1099 contractor
// policy, verified 2026-07-19). Shown on each sponsored card for honesty.
export const SPONSORED_ELIGIBILITY_NOTE =
    "US work authorization required — H-1B / STEM OPT not supported";

export const SPONSORED_JOBS: SponsoredJob[] = [
    {
        id: "list_AAABnbj9x4ZdBIsQp4xJ762_",
        org: "Mercor",
        title: "Medical Expert",
        pay: "$130–$180 / hr",
        tags: ["Contract", "AI Evaluation", "Healthcare", "US & Canada"],
        url: mercorUrl("list_AAABnbj9x4ZdBIsQp4xJ762_"),
        logoUrl: "/logos/mercor.png",
    },
    {
        id: "list_AAABn02PonKDTUdSiy5GwoHg",
        org: "Mercor",
        title: "Data Science Expert",
        pay: "$120–$170 / hr",
        tags: ["Contract", "AI Evaluation", "Data Science", "Remote"],
        url: mercorUrl("list_AAABn02PonKDTUdSiy5GwoHg"),
        logoUrl: "/logos/mercor.png",
    },
    {
        id: "list_AAABnRv1Qx3JfVJecKJOS6p6",
        org: "Mercor",
        title: "Physics PhD",
        pay: "$80–$100 / hr",
        tags: ["Contract", "AI Evaluation", "Physics", "Remote"],
        url: mercorUrl("list_AAABnRv1Qx3JfVJecKJOS6p6"),
        logoUrl: "/logos/mercor.png",
    },
    {
        id: "list_AAABnz4e5_LXbWF3Q3BK4Ls2",
        org: "Mercor",
        title: "STEM PhDs",
        pay: "$70–$75 / hr",
        tags: ["Contract", "AI Evaluation", "STEM Research", "Remote"],
        url: mercorUrl("list_AAABnz4e5_LXbWF3Q3BK4Ls2"),
        logoUrl: "/logos/mercor.png",
    },
    {
        id: "list_AAABnmYh74ctdwnp6bJOf5vx",
        org: "Mercor",
        title: "Biology Research Scientist (BA, MS, PhD)",
        pay: "$50–$70 / hr",
        tags: ["Contract", "AI Evaluation", "Biology", "Remote"],
        url: mercorUrl("list_AAABnmYh74ctdwnp6bJOf5vx"),
        logoUrl: "/logos/mercor.png",
    },
    {
        id: "list_AAABnonIKKQ9b5g5FzJHvZMH",
        org: "Mercor",
        title: "CUDA Engineering Expert",
        pay: "$80–$100 / hr",
        tags: ["Contract", "AI Evaluation", "GPU Engineering", "Remote"],
        url: mercorUrl("list_AAABnonIKKQ9b5g5FzJHvZMH"),
        logoUrl: "/logos/mercor.png",
    },
];

// Client-side only (Math.random would cause an SSR hydration mismatch).
export function pickTwoSponsoredJobs(): [SponsoredJob, SponsoredJob] | null {
    if (SPONSORED_JOBS.length < 2) return null;
    const first = Math.floor(Math.random() * SPONSORED_JOBS.length);
    let second = Math.floor(Math.random() * (SPONSORED_JOBS.length - 1));
    if (second >= first) second += 1;
    return [SPONSORED_JOBS[first], SPONSORED_JOBS[second]];
}

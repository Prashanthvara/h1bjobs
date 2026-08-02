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

// Pool refreshed 2026-08-01: four of the original six listings had closed
// (`disableApplications: true` in the listing payload — note that `status`
// stays "active" on closed listings, so it is not a usable signal). Run
// `npm run check:sponsored` to catch the next expiry before visitors do.
//
// Entries marked "evergreen" are Mercor Talent Network listings, which stay
// open indefinitely; the rest are campaign listings tied to a client
// engagement and close when it fills. The mix is deliberate: evergreen
// entries keep the pool alive, campaign entries pay better.
//
// None of these carry a location restriction. Per Mercor's referral policy,
// unrestricted listings default to US / Canada / UK / EU applicants.
export const SPONSORED_JOBS: SponsoredJob[] = [
    {
        // evergreen
        id: "list_AAABnJzK0z1CNefOyERAAb9m",
        org: "Mercor",
        title: "Physician Talent Network",
        pay: "$110–$250 / hr",
        tags: ["Contract", "AI Evaluation", "Medicine", "US · CA · UK · EU"],
        url: mercorUrl("list_AAABnJzK0z1CNefOyERAAb9m"),
        logoUrl: "/logos/mercor.png",
    },
    {
        // evergreen
        id: "list_AAABnJzIt-SOsdwOeF5Ebarf",
        org: "Mercor",
        title: "Machine Learning Engineer",
        pay: "$70–$250 / hr",
        tags: ["Contract", "AI Evaluation", "Machine Learning", "US · CA · UK · EU"],
        url: mercorUrl("list_AAABnJzIt-SOsdwOeF5Ebarf"),
        logoUrl: "/logos/mercor.png",
    },
    {
        id: "list_AAABn02PonKDTUdSiy5GwoHg",
        org: "Mercor",
        title: "Data Science Expert",
        pay: "$120–$170 / hr",
        tags: ["Contract", "AI Evaluation", "Data Science", "US · CA · UK · EU"],
        url: mercorUrl("list_AAABn02PonKDTUdSiy5GwoHg"),
        logoUrl: "/logos/mercor.png",
    },
    {
        id: "list_AAABnkZ4wiDh3d6MuLhH-LCo",
        org: "Mercor",
        title: "Research Physics Expert",
        pay: "$80–$135 / hr",
        tags: ["Contract", "AI Evaluation", "Physics", "US · CA · UK · EU"],
        url: mercorUrl("list_AAABnkZ4wiDh3d6MuLhH-LCo"),
        logoUrl: "/logos/mercor.png",
    },
    {
        id: "list_AAABnonIKKQ9b5g5FzJHvZMH",
        org: "Mercor",
        title: "CUDA Engineering Expert",
        pay: "$80–$100 / hr",
        tags: ["Contract", "AI Evaluation", "GPU Engineering", "US · CA · UK · EU"],
        url: mercorUrl("list_AAABnonIKKQ9b5g5FzJHvZMH"),
        logoUrl: "/logos/mercor.png",
    },
    {
        // evergreen
        id: "list_AAABnJ0CrCN6LLqupi9Bf6jc",
        org: "Mercor",
        title: "Biologist Talent Network",
        pay: "$60–$80 / hr",
        tags: ["Contract", "AI Evaluation", "Biology", "US · CA · UK · EU"],
        url: mercorUrl("list_AAABnJ0CrCN6LLqupi9Bf6jc"),
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

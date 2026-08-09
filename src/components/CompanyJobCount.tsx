import Link from "next/link";
import type { CompanyJobCount as CompanyJobCountValue } from "@/lib/companyJobCounts";

interface CompanyJobCountProps {
    /** Undefined when the employer has no jobs in the 30-day window. */
    count?: CompanyJobCountValue;
    className?: string;
}

/**
 * "● 47 open jobs · 6 added this week", linking to the jobs feed for that
 * employer.
 *
 * The link carries `range=30d` alongside the employer because `open` is a
 * 30-day figure. Without it the destination would show every job the feed
 * holds for the employer and land on a different number than the one clicked.
 *
 * The "added this week" clause is dropped rather than rendered as "0 added
 * this week", which reads as a negative signal about an employer that is in
 * fact hiring.
 *
 * The empty state names the feed, not the employer, and that wording is not
 * interchangeable with "No open jobs right now". The counts come from the
 * newest 1000 visa jobs, a window currently spanning about 20 days — an
 * employer can be hiring actively and still be absent from it (measured:
 * 2 of 18 companies on 2026-08-08). Claiming they have no openings would be
 * a statement we cannot support from this data.
 */
export function CompanyJobCount({ count, className = "" }: CompanyJobCountProps) {
    if (!count) {
        return (
            <span className={`text-sm text-gray-400 ${className}`}>No recent openings in our feed</span>
        );
    }

    const openLabel = `${count.open.toLocaleString("en-US")} open ${count.open === 1 ? "job" : "jobs"}`;
    const recentLabel = `${count.recent.toLocaleString("en-US")} added this week`;

    return (
        <Link
            href={`/?org=${encodeURIComponent(count.org)}&range=30d`}
            className={`group inline-flex items-baseline gap-1.5 text-sm whitespace-nowrap ${className}`}
            aria-label={`View ${openLabel} at ${count.org}`}
        >
            <span
                className="self-center h-1.5 w-1.5 shrink-0 rounded-full bg-green-500 ring-3 ring-green-500/20"
                aria-hidden="true"
            />
            <span className="font-semibold text-green-700 group-hover:underline">{openLabel}</span>
            {count.recent > 0 && (
                <>
                    <span className="text-gray-300" aria-hidden="true">·</span>
                    <span className="text-gray-500">{recentLabel}</span>
                </>
            )}
        </Link>
    );
}

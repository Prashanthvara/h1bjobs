"use client"

import Link, { useLinkStatus } from "next/link";

/**
 * Inline feedback while a tab navigation is in flight.
 *
 * `useLinkStatus` must be rendered as a descendant of the <Link> it reports
 * on. Next skips the pending state entirely when the destination is already
 * in the prefetch cache, which — both routes being static and prefetched on
 * viewport entry — is the common case. This exists for the tail: a click that
 * lands before hydration, on a slow connection, or with prefetch suppressed.
 */
function PendingHint() {
	const { pending } = useLinkStatus();
	return <span aria-hidden className={`nav-hint${pending ? " is-pending" : ""}`} />;
}

interface ExploreTabsProps {
	/** Which route is currently rendering. Drives styling and aria-current. */
	active: "jobs" | "companies";
	/** null when unknown — the tab omits the number rather than showing 0. */
	jobCount: number | null;
	companyCount: number | null;
}

const TAB_BASE =
	"flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-full transition-colors inline-flex items-center justify-center";

/**
 * The Jobs / Companies switcher.
 *
 * These are real anchors, not buttons. That is the point: a click handler is
 * invisible to search crawlers, so a button here would leave /companies
 * undiscoverable and defeat the reason the route exists.
 */
export function ExploreTabs({ active, jobCount, companyCount }: ExploreTabsProps) {
	const tabs = [
		{ key: "jobs" as const, href: "/", label: "Explore Jobs", count: jobCount },
		{ key: "companies" as const, href: "/companies", label: "Explore Companies", count: companyCount },
	];

	return (
		<nav
			aria-label="Explore"
			className="flex w-full md:w-auto rounded-full border border-gray-200 bg-white p-1 shadow-sm"
		>
			{tabs.map((tab) => {
				const isActive = tab.key === active;
				return (
					<Link
						key={tab.key}
						href={tab.href}
						aria-current={isActive ? "page" : undefined}
						// The href stays on the active tab so crawlers still see a
						// complete pair of links, but the click is suppressed: the
						// control this replaced was a no-op when already selected,
						// and letting it navigate to the current URL would scroll a
						// reading user back to the top for nothing. A self-link
						// carries no crawl value, so blocking the click costs none.
						onClick={isActive ? (event) => event.preventDefault() : undefined}
						className={`${TAB_BASE} ${isActive ? "bg-black text-white shadow-sm" : "text-black hover:text-black"}`}
					>
						{tab.label}
						{tab.count !== null && (
							<span className={`ml-2 text-xs ${isActive ? "text-white/70" : "text-gray-400"}`}>
								{/* Locale pinned: the count is baked into static HTML at
								    build time, so letting the client format it in its own
								    locale ("1.262" vs "1,262") is a hydration mismatch. */}
								{tab.count.toLocaleString("en-US")}
							</span>
						)}
						<PendingHint />
					</Link>
				);
			})}
		</nav>
	);
}

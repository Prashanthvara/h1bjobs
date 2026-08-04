import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ExploreTabs } from "@/components/ExploreTabs";
import { CompaniesClient } from "@/components/CompaniesClient";
import { fetchCompanies } from "@/lib/companyData";
import { fetchVisaJobCount } from "@/lib/jobData";
import { routeMetadata } from "@/lib/sharedMetadata";

export const revalidate = 86400;

// Built rather than hand-written: defining openGraph here would replace the
// root layout's object outright, and forgetting the shared image would drop
// this route's social preview with nothing failing. See sharedMetadata.ts.
export const metadata: Metadata = routeMetadata({
	title: "H-1B Cap-Exempt Employers — Universities, Research Institutes & Nonprofits",
	socialTitle: "H-1B Cap-Exempt Employers",
	description:
		"Browse H-1B cap-exempt employers that can sponsor a visa without the lottery. See past approvals, the departments actively hiring, and why each organization qualifies as cap-exempt.",
	path: "/companies",
});

export default async function CompaniesPage() {
	const [
		{ companies, error },
		{ count: visaJobCount, error: countError },
	] = await Promise.all([fetchCompanies(), fetchVisaJobCount()]);

	// Same reasoning as the home route: this render is cached for `revalidate`
	// seconds, so returning an error page here would serve it for a full day.
	// Throwing fails the build instead, and on background regeneration makes
	// Next.js keep serving the last good cached page. The companies ARE this
	// page, so unlike on /, there is nothing worth rendering without them.
	if (error) {
		throw new Error(`Refusing to cache an error page for the companies route: ${error}`);
	}

	// Only affects the number on the inactive tab. `observability` is enabled in
	// wrangler.jsonc, so this reaches the logs.
	if (countError) {
		console.error("visa job count query failed:", countError);
	}

	return (
		<div className="min-h-screen bg-white font-sans text-slate-900">
			<Header />
			<main className="flex flex-col items-center w-full">
				<Hero
					title="H-1B Cap-Exempt Employers"
					subtitle="Universities, research institutes, and non-profits that can sponsor your H-1B at any time of year — no cap, no lottery."
				>
					<ExploreTabs
						active="companies"
						jobCount={visaJobCount}
						companyCount={companies.length}
					/>
				</Hero>

				<CompaniesClient companies={companies} />
			</main>
			<Footer />
		</div>
	);
}

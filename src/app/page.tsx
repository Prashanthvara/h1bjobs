import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";
import { fetchVisaJobs, fetchVisaJobCount } from "@/lib/jobData";
import { fetchCompanies } from "@/lib/companyData";

export const revalidate = 86400;

export const metadata: Metadata = {
	alternates: {
		canonical: "/",
	},
};

export default async function HomePage() {
	const [
		{ jobs, error },
		{ companies, error: companiesError },
		{ count: visaJobCount, error: countError },
	] = await Promise.all([fetchVisaJobs(), fetchCompanies(), fetchVisaJobCount()]);

	// This render is cached for `revalidate` seconds, so without this guard a
	// build (or background regeneration) that hits a Supabase failure would bake
	// an error page into the cache and serve it for a full day. Throwing instead
	// fails the build, and on regeneration makes Next.js keep serving the last
	// good cached page — both preferable to publishing a broken one.
	if (error) {
		throw new Error(`Refusing to cache an error page for the home route: ${error}`);
	}

	// Not surfaced to the user: the badge falls back to the loaded row count,
	// which looks plausible enough to hide a permanently broken count query.
	// `observability` is enabled in wrangler.jsonc, so this reaches the logs.
	if (countError) {
		console.error("visa job count query failed:", countError);
	}

	return (
		<HomeClient
			initialJobs={jobs}
			visaJobCount={visaJobCount}
			initialError={error}
			initialCompanies={companies}
			companiesError={companiesError}
		/>
	);
}

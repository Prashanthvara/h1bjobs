import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";
import { fetchVisaJobs } from "@/lib/jobData";
import { fetchCompanies } from "@/lib/companyData";

export const revalidate = 86400;

export const metadata: Metadata = {
	alternates: {
		canonical: "/",
	},
};

export default async function HomePage() {
	const [{ jobs, error }, { companies, error: companiesError }] = await Promise.all([
		fetchVisaJobs(),
		fetchCompanies(),
	]);
	return (
		<HomeClient
			initialJobs={jobs}
			initialError={error}
			initialCompanies={companies}
			companiesError={companiesError}
		/>
	);
}

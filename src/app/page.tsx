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
	const [{ jobs, error }, { companies, error: companiesError }, { count: visaJobCount }] =
		await Promise.all([fetchVisaJobs(), fetchCompanies(), fetchVisaJobCount()]);
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

import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";
import { fetchVisaJobs } from "@/lib/jobData";

export const revalidate = 86400;

export const metadata: Metadata = {
	title: "Visa-Sponsored Jobs",
	description: "Browse visa-sponsored roles from cap-exempt employers with filters for location, skills, and recency.",
	alternates: {
		canonical: "/jobs",
	},
};

export default async function JobsPage() {
	const { jobs, error } = await fetchVisaJobs();
	return <HomeClient initialJobs={jobs} initialError={error} showCompanies={false} />;
}

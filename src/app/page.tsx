import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";
import { fetchVisaJobs } from "@/lib/jobData";

export const revalidate = 86400;

export const metadata: Metadata = {
	alternates: {
		canonical: "/",
	},
};

export default async function HomePage() {
	const { jobs, error } = await fetchVisaJobs();
	return <HomeClient initialJobs={jobs} initialError={error} />;
}

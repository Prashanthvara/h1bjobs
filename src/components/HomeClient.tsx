"use client"

import { Suspense, useCallback, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ExploreTabs } from "@/components/ExploreTabs";
import { FilterBar } from "@/components/FilterBar";
import { JobsList } from "@/components/JobsList";
import { JobUrlFilters } from "@/components/JobUrlFilters";
import type { JobUrlFilterValues } from "@/lib/jobUrlFilters";
import { CompanySummary } from "@/lib/companyTypes";
import { Job, JobDateRange } from "@/lib/jobTypes";
import {
	filterJobsByDateRange,
	filterJobsByDepartment,
	filterJobsByKeyword,
	filterJobsByLocation,
	filterJobsByOrg,
	normalizeJobDepartments,
	normalizeJobKeywords,
	normalizeJobLocations,
} from "@/lib/jobFilterUtils";
import {
	hasActiveJobFilters,
	rankJobs,
	resolveRankingOptions,
	type JobFilterState,
} from "@/lib/jobRanking";

interface HomeClientProps {
	initialJobs: Job[];
	/** 30-day total; null when the count query failed, never an implicit 0. */
	visaJobCount: number | null;
	/**
	 * Always null in practice — page.tsx throws before rendering when the jobs
	 * query fails, rather than caching an error page for an hour. Kept as the
	 * seam for a future non-fatal degradation path; JobsList already renders
	 * this state. Do not build logic that assumes it can be populated today.
	 */
	initialError?: string | null;
	/** Name and logo only — supplies job-card logos, not a company listing. */
	companies: CompanySummary[];
	/** null when the company query failed, so the tab omits the number. */
	companyCount: number | null;
}

export function HomeClient({
	initialJobs,
	visaJobCount,
	initialError,
	companies,
	companyCount,
}: HomeClientProps) {
	const jobs = initialJobs;
	const jobsError = initialError ?? null;

	const [jobSelectedLocations, setJobSelectedLocations] = useState<string[]>([]);
	const [jobSelectedKeyword, setJobSelectedKeyword] = useState<string | undefined>(undefined);
	const [jobSelectedOrg, setJobSelectedOrg] = useState<string | undefined>(undefined);
	const [jobSelectedDepartment, setJobSelectedDepartment] = useState<string | undefined>(undefined);
	const [jobDateRange, setJobDateRange] = useState<JobDateRange | undefined>(undefined);
	const [jobSearchQuery, setJobSearchQuery] = useState<string>("");

	const searchFilteredJobs = useMemo(() => {
		if (!jobSearchQuery) return jobs;

		const query = jobSearchQuery.toLowerCase();
		return jobs.filter((job) => {
			const titleMatch = (job.job_title || "").toLowerCase().includes(query);
			const orgMatch = (job.org || "").toLowerCase().includes(query);
			const keywordMatch = normalizeJobKeywords(job.keywords).some((keyword) =>
				keyword.toLowerCase().includes(query)
			);
			const locationMatch = normalizeJobLocations(job.location).some((location) =>
				location.toLowerCase().includes(query)
			);
			const departmentMatch = normalizeJobDepartments(job.department).some((dept) =>
				dept.toLowerCase().includes(query)
			);

			return titleMatch || orgMatch || keywordMatch || locationMatch || departmentMatch;
		});
	}, [jobSearchQuery, jobs]);

	const filteredJobs = useMemo(() => {
		let filtered = searchFilteredJobs;
		filtered = filterJobsByOrg(jobSelectedOrg, filtered);
		filtered = filterJobsByLocation(jobSelectedLocations, filtered);
		filtered = filterJobsByKeyword(jobSelectedKeyword, filtered);
		filtered = filterJobsByDepartment(jobSelectedDepartment, filtered);
		filtered = filterJobsByDateRange(jobDateRange, filtered);
		return filtered;
	}, [jobDateRange, jobSelectedDepartment, jobSelectedKeyword, jobSelectedLocations, jobSelectedOrg, searchFilteredJobs]);

	const filterState: JobFilterState = useMemo(
		() => ({
			org: jobSelectedOrg,
			keyword: jobSelectedKeyword,
			department: jobSelectedDepartment,
			dateRange: jobDateRange,
			locations: jobSelectedLocations,
			search: jobSearchQuery,
		}),
		[
			jobDateRange,
			jobSearchQuery,
			jobSelectedDepartment,
			jobSelectedKeyword,
			jobSelectedLocations,
			jobSelectedOrg,
		]
	);

	// Skipping this when nothing is filtered is the whole performance story:
	// `initialJobs` arrived already ranked from the server, and every filter
	// returns its input unchanged when unset, so `filteredJobs` is still that
	// same ranked array. Ranking again would burn ~2ms on hydration to produce
	// a result identical to what is already on screen.
	const rankedJobs = useMemo(() => {
		if (!hasActiveJobFilters(filterState)) return filteredJobs;
		return rankJobs(filteredJobs, resolveRankingOptions(filterState));
	}, [filteredJobs, filterState]);

	const handleClearJobFilters = () => {
		setJobSelectedLocations([]);
		setJobSelectedKeyword(undefined);
		setJobSelectedOrg(undefined);
		setJobSelectedDepartment(undefined);
		setJobDateRange(undefined);
		setJobSearchQuery("");
	};

	// useCallback is load-bearing, not stylistic: JobUrlFilters lists this in an
	// effect's dependency array, so a fresh function on every render would
	// re-run that effect forever.
	const applyUrlFilters = useCallback((values: JobUrlFilterValues) => {
		setJobSelectedOrg(values.org);
		setJobDateRange(values.dateRange);
	}, []);

	return (
		<div className="min-h-screen bg-white font-sans text-slate-900">
			<Header />
			<main className="flex flex-col items-center w-full">
				<Suspense fallback={null}>
					<JobUrlFilters onFilters={applyUrlFilters} />
				</Suspense>

				<Hero
					title="Your Alternative Path to H1B Sponsorship"
					subtitle="Bring your skills to America's top universities, research institutes, and non-profits. Get your H1B sponsored while making a real-world impact."
				>
					<ExploreTabs
						active="jobs"
						jobCount={visaJobCount}
						companyCount={companyCount}
					/>
				</Hero>

				<FilterBar
					mode="jobs"
					jobs={searchFilteredJobs}
					selectedLocations={jobSelectedLocations}
					onLocationsChange={setJobSelectedLocations}
					selectedKeyword={jobSelectedKeyword}
					onKeywordChange={setJobSelectedKeyword}
					selectedOrg={jobSelectedOrg}
					onOrgChange={setJobSelectedOrg}
					selectedDepartment={jobSelectedDepartment}
					onDepartmentChange={setJobSelectedDepartment}
					selectedDateRange={jobDateRange}
					onDateRangeChange={setJobDateRange}
					searchQuery={jobSearchQuery}
					onSearchChange={setJobSearchQuery}
					onClearFilters={handleClearJobFilters}
				/>

				<div id="jobs" className="w-full max-w-7xl mx-auto px-7 md:px-[150px] pb-20 scroll-mt-4">
					<div className="border-b border-gray-200 mb-4"></div>
					<JobsList jobs={rankedJobs} error={jobsError} companies={companies} />
				</div>
			</main>
			<Footer />
		</div>
	);
}

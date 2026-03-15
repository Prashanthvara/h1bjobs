"use client"

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { SearchFilters } from "@/components/SearchFilters";
import { CompanyList } from "@/components/CompanyList";
import { JobsFilters } from "@/components/JobsFilters";
import { JobsList } from "@/components/JobsList";
import { companies } from "@/lib/mockData";
import { Job, JobDateRange } from "@/lib/jobTypes";
import {
	filterJobsByDateRange,
	filterJobsByKeyword,
	filterJobsByLocation,
	normalizeJobKeywords,
	normalizeJobLocations,
} from "@/lib/jobFilterUtils";

interface HomeClientProps {
	initialJobs: Job[];
	initialError?: string | null;
	showCompanies?: boolean;
}

export function HomeClient({ initialJobs, initialError, showCompanies = true }: HomeClientProps) {
	const [activeTab, setActiveTab] = useState<"jobs" | "companies">("jobs");
	const showJobs = !showCompanies || activeTab === "jobs";

	const jobs = initialJobs;
	const jobsError = initialError ?? null;

	const [jobSelectedLocation, setJobSelectedLocation] = useState<string | undefined>(undefined);
	const [jobSelectedKeyword, setJobSelectedKeyword] = useState<string | undefined>(undefined);
	const [jobDateRange, setJobDateRange] = useState<JobDateRange | undefined>(undefined);
	const [jobSearchQuery, setJobSearchQuery] = useState<string>("");

	const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
	const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
	const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const searchFilteredCompanies = useMemo(() => {
		if (!searchQuery) return companies;

		const query = searchQuery.toLowerCase();
		return companies.filter((company) => {
			return (
				company.name.toLowerCase().includes(query) ||
				company.jobtitles.toLowerCase().includes(query) ||
				company.department.toLowerCase().includes(query) ||
				company.tags.toLowerCase().includes(query)
			);
		});
	}, [searchQuery]);

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

			return titleMatch || orgMatch || keywordMatch || locationMatch;
		});
	}, [jobSearchQuery, jobs]);

	const filteredJobs = useMemo(() => {
		let filtered = searchFilteredJobs;
		filtered = filterJobsByLocation(jobSelectedLocation, filtered);
		filtered = filterJobsByKeyword(jobSelectedKeyword, filtered);
		filtered = filterJobsByDateRange(jobDateRange, filtered);
		return filtered;
	}, [jobDateRange, jobSelectedKeyword, jobSelectedLocation, searchFilteredJobs]);

	const handleClearFilters = () => {
		setSelectedLocation(undefined);
		setSelectedRole(undefined);
		setSelectedDepartment(undefined);
		setSearchQuery("");
	};

	const handleClearJobFilters = () => {
		setJobSelectedLocation(undefined);
		setJobSelectedKeyword(undefined);
		setJobDateRange(undefined);
		setJobSearchQuery("");
	};

	return (
		<div className="min-h-screen bg-white font-sans text-slate-900">
			<Header />
			<main className="flex flex-col items-center w-full">
				<Hero />
				<div id="jobs" className="w-full max-w-7xl px-6 md:px-12 pb-20 scroll-mt-4">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
						{showCompanies && (
							<div className="flex w-full md:w-auto rounded-full border border-gray-200 bg-white p-1 shadow-sm">
								<button
									type="button"
									onClick={() => setActiveTab("jobs")}
									className={`flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === "jobs"
											? "bg-slate-900 text-white shadow-sm"
											: "text-gray-600 hover:text-gray-900"
										}`}
								>
									Explore Jobs
									<span className={`ml-2 text-xs ${activeTab === "jobs" ? "text-white/70" : "text-gray-400"}`}>
										{jobs.length}
									</span>
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("companies")}
									className={`flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === "companies"
											? "bg-slate-900 text-white shadow-sm"
											: "text-gray-600 hover:text-gray-900"
										}`}
								>
									Explore Companies
									<span className={`ml-2 text-xs ${activeTab === "companies" ? "text-white/70" : "text-gray-400"}`}>
										{companies.length}
									</span>
								</button>
							</div>
						)}
					</div>
					<div className="flex flex-col lg:flex-row gap-12 lg:items-start">
						<div className="w-full lg:w-1/3 xl:w-1/4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
							{showJobs ? (
								<JobsFilters
									selectedLocation={jobSelectedLocation}
									onLocationChange={(value) => setJobSelectedLocation(value || undefined)}
									selectedKeyword={jobSelectedKeyword}
									onKeywordChange={(value) => setJobSelectedKeyword(value || undefined)}
									selectedDateRange={jobDateRange}
									onDateRangeChange={setJobDateRange}
									searchQuery={jobSearchQuery}
									onSearchChange={setJobSearchQuery}
									onClearFilters={handleClearJobFilters}
									jobs={searchFilteredJobs}
								/>
							) : (
								<SearchFilters
									selectedLocation={selectedLocation}
									onLocationChange={setSelectedLocation}
									selectedRole={selectedRole}
									onRoleChange={setSelectedRole}
									selectedDepartment={selectedDepartment}
									onDepartmentChange={setSelectedDepartment}
									searchQuery={searchQuery}
									onSearchChange={setSearchQuery}
									onClearFilters={handleClearFilters}
									companies={searchFilteredCompanies}
								/>
							)}
						</div>
						<div className="w-full lg:w-2/3 xl:w-3/4">
							{showJobs ? (
								<JobsList jobs={filteredJobs} error={jobsError} />
							) : (
								<CompanyList
									selectedLocation={selectedLocation}
									selectedRole={selectedRole}
									selectedDepartment={selectedDepartment}
									companies={searchFilteredCompanies}
								/>
							)}
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}

"use client"

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { FilterBar } from "@/components/FilterBar";
import { CompanyList } from "@/components/CompanyList";
import { JobsList } from "@/components/JobsList";
import { Company } from "@/lib/companyTypes";
import { Job, JobDateRange } from "@/lib/jobTypes";
import {
	filterJobsByDateRange,
	filterJobsByDepartment,
	filterJobsByKeyword,
	filterJobsByLocation,
	normalizeJobDepartments,
	normalizeJobKeywords,
	normalizeJobLocations,
} from "@/lib/jobFilterUtils";
import {
	filterCompaniesByLocation,
	filterCompaniesByRole,
	filterCompaniesByDepartment,
} from "@/lib/filterUtils";

interface HomeClientProps {
	initialJobs: Job[];
	totalJobCount?: number;
	initialError?: string | null;
	initialCompanies: Company[];
	companiesError?: string | null;
	showCompanies?: boolean;
}

export function HomeClient({
	initialJobs,
	totalJobCount,
	initialError,
	initialCompanies,
	companiesError,
	showCompanies = true,
}: HomeClientProps) {
	const [activeTab, setActiveTab] = useState<"jobs" | "companies">("jobs");
	const showJobs = !showCompanies || activeTab === "jobs";

	const jobs = initialJobs;
	const jobsError = initialError ?? null;
	const companies = initialCompanies;

	// Job filter state
	const [jobSelectedLocations, setJobSelectedLocations] = useState<string[]>([]);
	const [jobSelectedKeyword, setJobSelectedKeyword] = useState<string | undefined>(undefined);
	const [jobSelectedDepartment, setJobSelectedDepartment] = useState<string | undefined>(undefined);
	const [jobDateRange, setJobDateRange] = useState<JobDateRange | undefined>(undefined);
	const [jobSearchQuery, setJobSearchQuery] = useState<string>("");

	// Company filter state
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
	}, [searchQuery, companies]);

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
		filtered = filterJobsByLocation(jobSelectedLocations, filtered);
		filtered = filterJobsByKeyword(jobSelectedKeyword, filtered);
		filtered = filterJobsByDepartment(jobSelectedDepartment, filtered);
		filtered = filterJobsByDateRange(jobDateRange, filtered);
		return filtered;
	}, [jobDateRange, jobSelectedDepartment, jobSelectedKeyword, jobSelectedLocations, searchFilteredJobs]);

	const filteredCompanies = useMemo(() => {
		let filtered = searchFilteredCompanies;
		filtered = filterCompaniesByLocation(selectedLocation, filtered);
		filtered = filterCompaniesByRole(selectedRole, filtered);
		filtered = filterCompaniesByDepartment(selectedDepartment, filtered);
		return filtered;
	}, [searchFilteredCompanies, selectedLocation, selectedRole, selectedDepartment]);

	const handleClearFilters = () => {
		setSelectedLocation(undefined);
		setSelectedRole(undefined);
		setSelectedDepartment(undefined);
		setSearchQuery("");
	};

	const handleClearJobFilters = () => {
		setJobSelectedLocations([]);
		setJobSelectedKeyword(undefined);
		setJobSelectedDepartment(undefined);
		setJobDateRange(undefined);
		setJobSearchQuery("");
	};

	return (
		<div className="min-h-screen bg-white font-sans text-slate-900">
			<Header />
			<main className="flex flex-col items-center w-full">
				<Hero>
					{showCompanies && (
						<div className="flex w-full md:w-auto rounded-full border border-gray-200 bg-white p-1 shadow-sm">
							<button
								type="button"
								onClick={() => setActiveTab("jobs")}
								className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === "jobs"
									? "bg-black text-white shadow-sm"
									: "text-black hover:text-black"
									}`}
							>
								Explore Jobs
								<span className={`ml-2 text-xs ${activeTab === "jobs" ? "text-white/70" : "text-gray-400"}`}>
									{filteredJobs.length !== (totalJobCount ?? jobs.length)
										? `${filteredJobs.length.toLocaleString()} of ${totalJobCount?.toLocaleString() ?? jobs.length.toLocaleString()}`
										: totalJobCount?.toLocaleString() ?? jobs.length.toLocaleString()}
								</span>
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("companies")}
								className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === "companies"
									? "bg-black text-white shadow-sm"
									: "text-black hover:text-black"
									}`}
							>
								Explore Companies
								<span className={`ml-2 text-xs ${activeTab === "companies" ? "text-white/70" : "text-gray-400"}`}>
									{companies.length}
								</span>
							</button>
						</div>
					)}
				</Hero>

				{/* Filter bar */}
				{showJobs ? (
					<FilterBar
						mode="jobs"
						jobs={searchFilteredJobs}
						allJobsCount={totalJobCount ?? jobs.length}
						filteredCount={filteredJobs.length}
						selectedLocations={jobSelectedLocations}
						onLocationsChange={setJobSelectedLocations}
						selectedKeyword={jobSelectedKeyword}
						onKeywordChange={setJobSelectedKeyword}
						selectedDepartment={jobSelectedDepartment}
						onDepartmentChange={setJobSelectedDepartment}
						selectedDateRange={jobDateRange}
						onDateRangeChange={setJobDateRange}
						searchQuery={jobSearchQuery}
						onSearchChange={setJobSearchQuery}
						onClearFilters={handleClearJobFilters}
					/>
				) : (
					<FilterBar
						mode="companies"
						companies={searchFilteredCompanies}
						allCompaniesCount={companies.length}
						filteredCount={filteredCompanies.length}
						selectedLocation={selectedLocation}
						onLocationChange={setSelectedLocation}
						selectedRole={selectedRole}
						onRoleChange={setSelectedRole}
						selectedDepartment={selectedDepartment}
						onDepartmentChange={setSelectedDepartment}
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						onClearFilters={handleClearFilters}
					/>
				)}

				{/* Results - full width */}
				<div id="jobs" className="w-full max-w-7xl mx-auto px-7 md:px-[150px] pb-20 scroll-mt-4">
					<div className="border-b border-gray-200 mb-4"></div>
					{showJobs ? (
						<JobsList jobs={filteredJobs} error={jobsError} companies={companies} />
					) : companiesError ? (
						<div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
							{companiesError}
						</div>
					) : (
						<CompanyList
							selectedLocation={selectedLocation}
							selectedRole={selectedRole}
							selectedDepartment={selectedDepartment}
							companies={searchFilteredCompanies}
						/>
					)}
				</div>
			</main>
			<Footer />
		</div>
	);
}

"use client"

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { CompanyList } from "@/components/CompanyList";
import { Company } from "@/lib/companyTypes";
import type { CompanyJobCounts } from "@/lib/companyJobCounts";
import {
	filterCompaniesByLocation,
	filterCompaniesByRole,
	filterCompaniesByDepartment,
} from "@/lib/filterUtils";

interface CompaniesClientProps {
	companies: Company[];
	/** Keyed by company id; a missing entry means no open jobs. */
	jobCounts: CompanyJobCounts;
}

export function CompaniesClient({ companies, jobCounts }: CompaniesClientProps) {
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

	return (
		<>
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

			<div className="w-full max-w-7xl mx-auto px-7 md:px-[150px] pb-20 scroll-mt-4">
				<div className="border-b border-gray-200 mb-4"></div>
				<div className="w-full flex flex-col gap-6">
					<h2 className="font-bold text-xl">All cap-exempt employers</h2>
					<CompanyList companies={filteredCompanies} jobCounts={jobCounts} />
				</div>
			</div>
		</>
	);
}

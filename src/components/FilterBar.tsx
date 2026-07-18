"use client"

import { useState, useEffect, useMemo } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Job, JobDateRange } from "@/lib/jobTypes";
import {
    filterJobsByDateRange,
    filterJobsByDepartment,
    filterJobsByKeyword,
    filterJobsByLocation,
    getDepartmentOptions,
    getJobLocationOptions,
    getKeywordOptions,
} from "@/lib/jobFilterUtils";
import { Company } from "@/lib/companyTypes";
import {
    filterCompaniesByDepartment,
    filterCompaniesByLocation,
    filterCompaniesByRole,
    getDepartmentOptions as getCompanyDepartmentOptions,
    getLocationOptions as getCompanyLocationOptions,
    getRoleOptions,
} from "@/lib/filterUtils";
import { parseJobDate, startOfDay } from "@/lib/jobFilterUtils";

interface JobsFilterBarProps {
    mode: "jobs";
    jobs: Job[];
    allJobsCount: number;
    filteredCount: number;
    selectedLocations: string[];
    onLocationsChange: (values: string[]) => void;
    selectedKeyword?: string;
    onKeywordChange: (value: string | undefined) => void;
    selectedDepartment?: string;
    onDepartmentChange: (value: string | undefined) => void;
    selectedDateRange?: JobDateRange;
    onDateRangeChange: (value?: JobDateRange) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onClearFilters: () => void;
}

interface CompaniesFilterBarProps {
    mode: "companies";
    companies: Company[];
    allCompaniesCount: number;
    filteredCount: number;
    selectedLocation?: string;
    onLocationChange: (value: string | undefined) => void;
    selectedRole?: string;
    onRoleChange: (value: string | undefined) => void;
    selectedDepartment?: string;
    onDepartmentChange: (value: string | undefined) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onClearFilters: () => void;
}

type FilterBarProps = JobsFilterBarProps | CompaniesFilterBarProps;

function countJobsAddedToday(jobs: Job[]) {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return jobs.filter((job) => {
        const parsed = parseJobDate(job.job_posting_date);
        if (!parsed) return false;
        return parsed >= yesterday;
    }).length;
}

function getLastUpdatedDate(jobs: Job[]) {
    let latest: Date | null = null;
    for (const job of jobs) {
        const parsed = parseJobDate(job.job_posting_date);
        if (parsed && (!latest || parsed > latest)) {
            latest = parsed;
        }
    }
    if (!latest) return null;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(latest);
}

export function FilterBar(props: FilterBarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState(props.searchQuery);
    const { onSearchChange, searchQuery } = props;

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearchChange(localSearchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [localSearchQuery, onSearchChange]);

    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    const hasActiveFilters = (() => {
        if (props.mode === "jobs") {
            return !!(props.searchQuery || props.selectedLocations.length > 0 || props.selectedKeyword || props.selectedDepartment || props.selectedDateRange);
        }
        return !!(props.searchQuery || props.selectedLocation || props.selectedRole || props.selectedDepartment);
    })();

    const activeFilterCount = (() => {
        if (props.mode === "jobs") {
            let count = 0;
            if (props.searchQuery) count++;
            if (props.selectedLocations.length > 0) count++;
            if (props.selectedKeyword) count++;
            if (props.selectedDepartment) count++;
            if (props.selectedDateRange) count++;
            return count;
        }
        let count = 0;
        if (props.searchQuery) count++;
        if (props.selectedLocation) count++;
        if (props.selectedRole) count++;
        if (props.selectedDepartment) count++;
        return count;
    })();

    if (props.mode === "jobs") {
        return (
            <JobsFilterBarInner
                {...props}
                localSearchQuery={localSearchQuery}
                setLocalSearchQuery={setLocalSearchQuery}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                hasActiveFilters={hasActiveFilters}
                activeFilterCount={activeFilterCount}
            />
        );
    }

    return (
        <CompaniesFilterBarInner
            {...props}
            localSearchQuery={localSearchQuery}
            setLocalSearchQuery={setLocalSearchQuery}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
        />
    );
}

function JobsFilterBarInner({
    jobs,
    allJobsCount,
    filteredCount,
    selectedLocations,
    onLocationsChange,
    selectedKeyword,
    onKeywordChange,
    selectedDepartment,
    onDepartmentChange,
    selectedDateRange,
    onDateRangeChange,
    onClearFilters,
    localSearchQuery,
    setLocalSearchQuery,
    mobileOpen,
    setMobileOpen,
    hasActiveFilters,
    activeFilterCount,
}: JobsFilterBarProps & {
    localSearchQuery: string;
    setLocalSearchQuery: (v: string) => void;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
}) {
    // Dependent dropdown basis calculations
    const locationBasis = useMemo(() => {
        let filtered = jobs;
        filtered = filterJobsByKeyword(selectedKeyword, filtered);
        filtered = filterJobsByDepartment(selectedDepartment, filtered);
        filtered = filterJobsByDateRange(selectedDateRange, filtered);
        return filtered;
    }, [jobs, selectedKeyword, selectedDepartment, selectedDateRange]);

    const keywordBasis = useMemo(() => {
        let filtered = jobs;
        filtered = filterJobsByLocation(selectedLocations, filtered);
        filtered = filterJobsByDepartment(selectedDepartment, filtered);
        filtered = filterJobsByDateRange(selectedDateRange, filtered);
        return filtered;
    }, [jobs, selectedLocations, selectedDepartment, selectedDateRange]);

    const departmentBasis = useMemo(() => {
        let filtered = jobs;
        filtered = filterJobsByLocation(selectedLocations, filtered);
        filtered = filterJobsByKeyword(selectedKeyword, filtered);
        filtered = filterJobsByDateRange(selectedDateRange, filtered);
        return filtered;
    }, [jobs, selectedLocations, selectedKeyword, selectedDateRange]);

    const locationOptions = useMemo(() => getJobLocationOptions(locationBasis), [locationBasis]);
    const keywordOptions = useMemo(() => getKeywordOptions(keywordBasis), [keywordBasis]);
    const departmentOptions = useMemo(() => getDepartmentOptions(departmentBasis), [departmentBasis]);

    const addedToday = useMemo(() => countJobsAddedToday(jobs), [jobs]);
    const lastUpdated = useMemo(() => getLastUpdatedDate(jobs), [jobs]);

    const dateOptions: Array<{ value: JobDateRange; label: string }> = [
        { value: "24h", label: "Last 24 hours" },
        { value: "7d", label: "Last 7 days" },
        { value: "30d", label: "Last 30 days" },
    ];

    return (
        <div role="search" aria-label="Filter jobs" className="w-full">
            {/* Filter bar */}
            <div className="bg-white sticky top-[57px] z-40">
                <div className="max-w-7xl mx-auto px-7 md:px-[150px] py-3">
                    {/* Desktop: single row */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9 pr-8 h-10 border-gray-200 text-sm font-medium"
                                placeholder="Search by title, org, or skill..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                            />
                            {localSearchQuery && (
                                <X
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-black"
                                    onClick={() => setLocalSearchQuery("")}
                                />
                            )}
                        </div>
                        <MultiCombobox
                            className="w-[160px] h-10 text-sm font-medium"
                            groupedOptions={locationOptions}
                            values={selectedLocations}
                            onValuesChange={onLocationsChange}
                            placeholder="Location"
                            searchPlaceholder="Search locations..."
                            emptyText="No location found."
                        />
                        <Combobox
                            className="w-[160px] h-10 text-sm font-medium"
                            options={keywordOptions}
                            value={selectedKeyword}
                            onValueChange={(v) => onKeywordChange(v || undefined)}
                            placeholder="Skills"
                            searchPlaceholder="Search skills..."
                            emptyText="No skill found."
                        />
                        <Combobox
                            className="w-[160px] h-10 text-sm font-medium"
                            options={departmentOptions}
                            value={selectedDepartment}
                            onValueChange={(v) => onDepartmentChange(v || undefined)}
                            placeholder="Department"
                            searchPlaceholder="Search departments..."
                            emptyText="No department found."
                        />
                        <Select
                            value={selectedDateRange ?? "any"}
                            onValueChange={(value) => {
                                onDateRangeChange(value === "any" ? undefined : (value as JobDateRange));
                            }}
                        >
                            <SelectTrigger className="w-[150px] h-10 border-gray-200 text-sm font-medium">
                                <SelectValue placeholder="Date posted" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any time</SelectItem>
                                {dateOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mobile: search + filter toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9 pr-8 h-10 border-gray-200 text-sm font-medium"
                                placeholder="Search..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                            />
                            {localSearchQuery && (
                                <X
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-black"
                                    onClick={() => setLocalSearchQuery("")}
                                />
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-3 shrink-0 font-medium relative"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                            Filters
                        </Button>
                    </div>

                    {/* Mobile expanded panel */}
                    {mobileOpen && (
                        <div className="md:hidden mt-3 space-y-3 pb-1">
                            <MultiCombobox
                                className="w-full h-10 text-sm font-medium"
                                groupedOptions={locationOptions}
                                values={selectedLocations}
                                onValuesChange={onLocationsChange}
                                placeholder="Location"
                                searchPlaceholder="Search locations..."
                                emptyText="No location found."
                            />
                            <Combobox
                                className="w-full h-10 text-sm font-medium"
                                options={keywordOptions}
                                value={selectedKeyword}
                                onValueChange={(v) => onKeywordChange(v || undefined)}
                                placeholder="Skills"
                                searchPlaceholder="Search skills..."
                                emptyText="No skill found."
                            />
                            <Combobox
                                className="w-full h-10 text-sm font-medium"
                                options={departmentOptions}
                                value={selectedDepartment}
                                onValueChange={(v) => onDepartmentChange(v || undefined)}
                                placeholder="Department"
                                searchPlaceholder="Search departments..."
                                emptyText="No department found."
                            />
                            <Select
                                value={selectedDateRange ?? "any"}
                                onValueChange={(value) => {
                                    onDateRangeChange(value === "any" ? undefined : (value as JobDateRange));
                                }}
                            >
                                <SelectTrigger className="w-full h-10 border-gray-200 text-sm font-medium">
                                    <SelectValue placeholder="Date posted" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any time</SelectItem>
                                    {dateOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* Result summary row */}
            <div className="max-w-7xl mx-auto px-7 md:px-[150px] py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 font-medium text-black">
                    <span>{filteredCount === allJobsCount ? `${allJobsCount} jobs` : `${filteredCount} jobs`}</span>
                    {addedToday > 0 && (
                        <>
                            <span className="text-gray-300">·</span>
                            <span className="text-green-700">{addedToday} added yesterday</span>
                        </>
                    )}
                    {lastUpdated && (
                        <>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-500">Updated {lastUpdated}</span>
                        </>
                    )}
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-sm font-medium text-gray-500 hover:text-black h-auto py-1 px-2"
                    >
                        Clear
                        <X className="h-3.5 w-3.5 ml-1" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function CompaniesFilterBarInner({
    companies,
    allCompaniesCount,
    filteredCount,
    selectedLocation,
    onLocationChange,
    selectedRole,
    onRoleChange,
    selectedDepartment,
    onDepartmentChange,
    onClearFilters,
    localSearchQuery,
    setLocalSearchQuery,
    mobileOpen,
    setMobileOpen,
    hasActiveFilters,
}: CompaniesFilterBarProps & {
    localSearchQuery: string;
    setLocalSearchQuery: (v: string) => void;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
}) {
    // Dependent dropdown basis calculations
    const locationBasis = useMemo(() => {
        let filtered = companies;
        filtered = filterCompaniesByRole(selectedRole, filtered);
        filtered = filterCompaniesByDepartment(selectedDepartment, filtered);
        return filtered;
    }, [companies, selectedRole, selectedDepartment]);

    const roleBasis = useMemo(() => {
        let filtered = companies;
        filtered = filterCompaniesByLocation(selectedLocation, filtered);
        filtered = filterCompaniesByDepartment(selectedDepartment, filtered);
        return filtered;
    }, [companies, selectedLocation, selectedDepartment]);

    const departmentBasis = useMemo(() => {
        let filtered = companies;
        filtered = filterCompaniesByLocation(selectedLocation, filtered);
        filtered = filterCompaniesByRole(selectedRole, filtered);
        return filtered;
    }, [companies, selectedLocation, selectedRole]);

    const locationOptions = useMemo(() => getCompanyLocationOptions(locationBasis), [locationBasis]);
    const roleOptions = useMemo(() => getRoleOptions(roleBasis), [roleBasis]);
    const departmentOptions = useMemo(() => getCompanyDepartmentOptions(departmentBasis), [departmentBasis]);

    return (
        <div role="search" aria-label="Filter companies" className="w-full">
            {/* Filter bar */}
            <div className="bg-white sticky top-[57px] z-40">
                <div className="max-w-7xl mx-auto px-7 md:px-[150px] py-3">
                    {/* Desktop: single row */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9 pr-8 h-10 border-gray-200 text-sm font-medium"
                                placeholder="Search by name or role..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                            />
                            {localSearchQuery && (
                                <X
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-black"
                                    onClick={() => setLocalSearchQuery("")}
                                />
)}
                        </div>
                        <Combobox
                            className="w-[160px] h-10 text-sm font-medium"
                            groupedOptions={locationOptions}
                            value={selectedLocation}
                            onValueChange={(v) => onLocationChange(v || undefined)}
                            placeholder="Location"
                            searchPlaceholder="Search locations..."
                            emptyText="No location found."
                        />
                        <Combobox
                            className="w-[160px] h-10 text-sm font-medium"
                            options={roleOptions}
                            value={selectedRole}
                            onValueChange={(v) => onRoleChange(v || undefined)}
                            placeholder="Roles"
                            searchPlaceholder="Search roles..."
                            emptyText="No role found."
                        />
                        <Combobox
                            className="w-[160px] h-10 text-sm font-medium"
                            options={departmentOptions}
                            value={selectedDepartment}
                            onValueChange={(v) => onDepartmentChange(v || undefined)}
                            placeholder="Department"
                            searchPlaceholder="Search departments..."
                            emptyText="No department found."
                        />
                    </div>

                    {/* Mobile: search + filter toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9 pr-8 h-10 border-gray-200 text-sm font-medium"
                                placeholder="Search..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                            />
                            {localSearchQuery && (
                                <X
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-black"
                                    onClick={() => setLocalSearchQuery("")}
                                />
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-3 shrink-0 font-medium relative"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                            Filters
                        </Button>
                    </div>

                    {/* Mobile expanded panel */}
                    {mobileOpen && (
                        <div className="md:hidden mt-3 space-y-3 pb-1">
                            <Combobox
                                className="w-full h-10 text-sm font-medium"
                                groupedOptions={locationOptions}
                                value={selectedLocation}
                                onValueChange={(v) => onLocationChange(v || undefined)}
                                placeholder="Location"
                                searchPlaceholder="Search locations..."
                                emptyText="No location found."
                            />
                            <Combobox
                                className="w-full h-10 text-sm font-medium"
                                options={roleOptions}
                                value={selectedRole}
                                onValueChange={(v) => onRoleChange(v || undefined)}
                                placeholder="Roles"
                                searchPlaceholder="Search roles..."
                                emptyText="No role found."
                            />
                            <Combobox
                                className="w-full h-10 text-sm font-medium"
                                options={departmentOptions}
                                value={selectedDepartment}
                                onValueChange={(v) => onDepartmentChange(v || undefined)}
                                placeholder="Department"
                                searchPlaceholder="Search departments..."
                                emptyText="No department found."
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-7 md:px-[150px] py-3 flex items-center justify-between text-sm">
                <div className="font-medium text-black">
                    {filteredCount === allCompaniesCount ? `${allCompaniesCount} companies` : `${filteredCount} companies`}
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-sm font-medium text-gray-500 hover:text-black h-auto py-1 px-2"
                    >
                        Clear
                        <X className="h-3.5 w-3.5 ml-1" />
                    </Button>
                )}
            </div>
        </div>
    );
}

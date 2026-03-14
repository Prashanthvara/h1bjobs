import { useState, useEffect, useMemo } from "react";
import { Search, X, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Job, JobDateRange } from "@/lib/jobTypes";
import { filterJobsByDateRange, filterJobsByKeyword, filterJobsByLocation, getJobLocationOptions, getKeywordOptions } from "@/lib/jobFilterUtils";

interface JobsFiltersProps {
    selectedLocation?: string;
    onLocationChange?: (value: string) => void;
    selectedKeyword?: string;
    onKeywordChange?: (value: string) => void;
    selectedDateRange?: JobDateRange;
    onDateRangeChange?: (value?: JobDateRange) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onClearFilters?: () => void;
    jobs?: Job[];
}

export function JobsFilters({
    selectedLocation,
    onLocationChange,
    selectedKeyword,
    onKeywordChange,
    selectedDateRange,
    onDateRangeChange,
    searchQuery,
    onSearchChange,
    onClearFilters,
    jobs = [],
}: JobsFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Location options filtered by keyword
    const locationBasis = useMemo(() => {
        let filtered = jobs;
        filtered = filterJobsByKeyword(selectedKeyword, filtered);
        filtered = filterJobsByDateRange(selectedDateRange, filtered);
        return filtered;
    }, [jobs, selectedKeyword, selectedDateRange]);

    // Keyword options filtered by location
    const keywordBasis = useMemo(() => {
        let filtered = jobs;
        filtered = filterJobsByLocation(selectedLocation, filtered);
        filtered = filterJobsByDateRange(selectedDateRange, filtered);
        return filtered;
    }, [jobs, selectedLocation, selectedDateRange]);

    const locationOptions = useMemo(() => getJobLocationOptions(locationBasis), [locationBasis]);
    const keywordOptions = useMemo(() => getKeywordOptions(keywordBasis), [keywordBasis]);

    const hasActiveFilters = useMemo(() => {
        return !!(searchQuery || selectedLocation || selectedKeyword || selectedDateRange);
    }, [searchQuery, selectedLocation, selectedKeyword, selectedDateRange]);

    const dateOptions: Array<{ value: JobDateRange; label: string }> = [
        { value: "24h", label: "Last 24 hours" },
        { value: "7d", label: "Last 7 days" },
        { value: "30d", label: "Last 30 days" },
    ];

    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearchChange(localSearchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [localSearchQuery, onSearchChange]);

    // Sync local state if prop changes externally (e.g. clear filters)
    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    return (
        <div className="w-full sm:max-w-md">
            <div className="w-full flex flex-col gap-4">
                <div className="flex items-center justify-between min-h-9">
                    <h3 className="font-bold text-lg">Filters</h3>

                    <div className="flex items-center gap-2">
                        {hasActiveFilters && onClearFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearFilters}
                                className="text-sm"
                                aria-label="Clear all filters"
                            >
                                Clear
                            </Button>
                        )}
                        <div
                            className="lg:hidden cursor-pointer p-1"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <Menu className="h-5 w-5 text-gray-600" />
                        </div>
                    </div>
                </div>

                <div className={`space-y-4 ${isOpen ? "block" : "hidden"} lg:block`}>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            className="pl-10 pr-10 w-full h-11 border-gray-200 shadow-sm"
                            placeholder="Search by title, org, or skill"
                            value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}
                        />
                        {localSearchQuery && (
                            <X
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-gray-600"
                                onClick={() => setLocalSearchQuery("")}
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Location</label>
                        <Combobox
                            className="w-full"
                            groupedOptions={locationOptions}
                            value={selectedLocation}
                            onValueChange={onLocationChange}
                            placeholder="Select location..."
                            searchPlaceholder="Search locations..."
                            emptyText="No location found."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Skills & Tags</label>
                        <Combobox
                            className="w-full"
                            options={keywordOptions}
                            value={selectedKeyword}
                            onValueChange={onKeywordChange}
                            placeholder="Select skill..."
                            searchPlaceholder="Search skills..."
                            emptyText="No skill found."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Date Posted</label>
                        <Select
                            value={selectedDateRange ?? "any"}
                            onValueChange={(value) => {
                                onDateRangeChange?.(value === "any" ? undefined : (value as JobDateRange));
                            }}
                        >
                            <SelectTrigger className="w-full h-11 border-gray-200 shadow-sm">
                                <SelectValue placeholder="Select date range..." />
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

                    <p className="text-xs text-gray-500">Visa-sponsored roles only.</p>
                </div>
            </div>
        </div>
    );
}

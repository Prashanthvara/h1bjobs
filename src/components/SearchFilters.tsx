import { useState, useEffect, useMemo } from "react";
import { Search, X, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { getLocationOptions, getRoleOptions, getDepartmentOptions, filterCompaniesByLocation, filterCompaniesByRole, filterCompaniesByDepartment } from "@/lib/filterUtils";
import { Company } from "@/lib/mockData";

interface SearchFiltersProps {
    selectedLocation?: string;
    onLocationChange?: (value: string) => void;
    selectedRole?: string;
    onRoleChange?: (value: string) => void;
    selectedDepartment?: string;
    onDepartmentChange?: (value: string) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onClearFilters?: () => void;
    companies?: Company[];
}

export function SearchFilters({ selectedLocation, onLocationChange, selectedRole, onRoleChange, selectedDepartment, onDepartmentChange, searchQuery, onSearchChange, onClearFilters, companies = [] }: SearchFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    // 1. Location Options: Filter by Role + Dept
    const locationBasis = useMemo(() => {
        let filtered = companies;
        filtered = filterCompaniesByRole(selectedRole, filtered);
        filtered = filterCompaniesByDepartment(selectedDepartment, filtered);
        return filtered;
    }, [companies, selectedRole, selectedDepartment]);

    // 2. Role Options: Filter by Location + Dept
    const roleBasis = useMemo(() => {
        let filtered = companies;
        filtered = filterCompaniesByLocation(selectedLocation, filtered);
        filtered = filterCompaniesByDepartment(selectedDepartment, filtered);
        return filtered;
    }, [companies, selectedLocation, selectedDepartment]);

    // 3. Department Options: Filter by Location + Role
    const departmentBasis = useMemo(() => {
        let filtered = companies;
        filtered = filterCompaniesByLocation(selectedLocation, filtered);
        filtered = filterCompaniesByRole(selectedRole, filtered);
        return filtered;
    }, [companies, selectedLocation, selectedRole]);

    const locationOptions = useMemo(() => getLocationOptions(locationBasis), [locationBasis]);
    const roleOptions = useMemo(() => getRoleOptions(roleBasis), [roleBasis]);
    const departmentOptions = useMemo(() => getDepartmentOptions(departmentBasis), [departmentBasis]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return !!(searchQuery || selectedLocation || selectedRole || selectedDepartment);
    }, [searchQuery, selectedLocation, selectedRole, selectedDepartment]);

    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearchChange(localSearchQuery);
        }, 300); // 300ms debounce

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
                {/* Header / Toggle for Mobile */}
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

                {/* Filter Options Container */}
                <div className={`space-y-4 ${isOpen ? 'block' : 'hidden'} lg:block`}>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            className="pl-10 pr-10 w-full h-11 border-gray-200 shadow-sm"
                            placeholder="Search by name or role"
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
                        <label className="text-sm font-medium text-gray-600">Roles</label>
                        <Combobox
                            className="w-full"
                            options={roleOptions}
                            value={selectedRole}
                            onValueChange={onRoleChange}
                            placeholder="Select role..."
                            searchPlaceholder="Search roles..."
                            emptyText="No role found."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Department</label>
                        <Combobox
                            className="w-full"
                            options={departmentOptions}
                            value={selectedDepartment}
                            onValueChange={onDepartmentChange}
                            placeholder="Select department..."
                            searchPlaceholder="Search departments..."
                            emptyText="No department found."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

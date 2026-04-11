import { Company } from "./companyTypes";

/**
 * Extract unique states from company locations
 * Returns state codes (e.g., "CA", "MI")
 */
function getUniqueStates(companies: Company[]): string[] {
    const states = new Set<string>();

    companies.forEach((company) => {
        // Extract state from "City, STATE" format
        const parts = company.location.split(',');
        if (parts.length === 2) {
            const state = parts[1].trim();
            states.add(state);
        }
    });

    return Array.from(states).sort();
}

/**
 * Extract unique full locations from companies
 * Returns full location strings (e.g., "Ann Arbor, MI")
 */
function getUniqueLocations(companies: Company[]): string[] {
    const locations = new Set<string>();

    companies.forEach((company) => {
        locations.add(company.location);
    });

    return Array.from(locations).sort();
}

/**
 * Map state codes to full state names
 */
const stateNameMap: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
};

/**
 * Get all location options for the combobox, grouped by state
 * Returns array of groups with cities nested under their states
 */
export function getLocationOptions(companies: Company[]) {
    const states = getUniqueStates(companies);
    const locations = getUniqueLocations(companies);

    // Group locations by state
    const groups = states.map((stateCode) => {
        const stateName = stateNameMap[stateCode] || stateCode;

        // Get all cities in this state
        const citiesInState = locations.filter((location) =>
            location.endsWith(`, ${stateCode}`)
        );

        return {
            label: stateName,
            options: [
                // State-level option
                {
                    value: `state:${stateCode}`,
                    label: stateName,
                },
                // Individual cities in this state
                ...citiesInState.map((city) => ({
                    value: `city:${city}`,
                    label: city,
                }))
            ]
        };
    });

    return groups;
}

/**
 * Filter companies based on selected location
 * @param selectedValue - The value from the combobox (e.g., "state:CA" or "city:Ann Arbor, MI")
 * @param companies - Array of companies to filter
 * @returns Filtered array of companies
 */
export function filterCompaniesByLocation(selectedValue: string | undefined, companies: Company[]) {
    if (!selectedValue) {
        return companies;
    }

    const [type, value] = selectedValue.split(':');

    if (type === 'state') {
        // Filter by state - show all companies in this state
        return companies.filter((company) => company.location.endsWith(value));
    } else if (type === 'city') {
        // Filter by exact location match
        return companies.filter((company) => company.location === value);
    }

    return companies;
}

/**
 * Extract unique job titles from all companies
 * Parses comma-separated jobtitles field and returns sorted unique titles
 */
function getUniqueJobTitles(companies: Company[]): string[] {
    const jobTitles = new Set<string>();

    companies.forEach((company) => {
        // Split by comma and trim whitespace
        const titles = company.jobtitles.split(',').map((title: string) => title.trim());
        titles.forEach((title: string) => {
            if (title) { // Only add non-empty titles
                jobTitles.add(title);
            }
        });
    });

    return Array.from(jobTitles).sort();
}

/**
 * Get all role options for the combobox with company counts
 * Returns flat array of job title options with counts, sorted by count descending
 */
export function getRoleOptions(companies: Company[]) {
    const jobTitles = getUniqueJobTitles(companies);

    // Count how many companies have each job title
    const titleCounts = new Map<string, number>();
    jobTitles.forEach((title) => {
        const count = companies.filter((company) => {
            const titles = company.jobtitles.split(',').map((t: string) => t.trim());
            return titles.includes(title);
        }).length;
        titleCounts.set(title, count);
    });

    // Sort by count descending, then alphabetically for ties
    const sortedTitles = jobTitles.sort((a, b) => {
        const countDiff = (titleCounts.get(b) || 0) - (titleCounts.get(a) || 0);
        if (countDiff !== 0) return countDiff;
        return a.localeCompare(b); // Alphabetical for same count
    });

    return sortedTitles.map((title) => ({
        value: title,
        label: `${title} (${titleCounts.get(title)})`,
    }));
}

/**
 * Filter companies based on selected role
 * @param selectedRole - The selected job title
 * @param companies - Array of companies to filter
 * @returns Filtered array of companies that have the selected role
 */
export function filterCompaniesByRole(selectedRole: string | undefined, companies: Company[]) {
    if (!selectedRole) {
        return companies;
    }

    // Filter companies that have this job title in their jobtitles field
    return companies.filter((company) => {
        const titles = company.jobtitles.split(',').map((title: string) => title.trim());
        return titles.includes(selectedRole);
    });
}

/**
 * Extract unique departments from all companies
 * Parses comma-separated department field and returns sorted unique departments
 */
function getUniqueDepartments(companies: Company[]): string[] {
    const departments = new Set<string>();

    companies.forEach((company) => {
        // Split by comma and trim whitespace
        const depts = company.department.split(',').map((dept: string) => dept.trim());
        depts.forEach((dept: string) => {
            if (dept) { // Only add non-empty departments
                departments.add(dept);
            }
        });
    });

    return Array.from(departments).sort();
}

/**
 * Get all department options for the combobox with company counts
 * Returns flat array of department options with counts, sorted by count descending
 */
export function getDepartmentOptions(companies: Company[]) {
    const departments = getUniqueDepartments(companies);

    // Count how many companies have each department
    const deptCounts = new Map<string, number>();
    departments.forEach((dept) => {
        const count = companies.filter((company) => {
            const depts = company.department.split(',').map((d: string) => d.trim());
            return depts.includes(dept);
        }).length;
        deptCounts.set(dept, count);
    });

    // Sort by count descending, then alphabetically for ties
    const sortedDepartments = departments.sort((a, b) => {
        const countDiff = (deptCounts.get(b) || 0) - (deptCounts.get(a) || 0);
        if (countDiff !== 0) return countDiff;
        return a.localeCompare(b); // Alphabetical for same count
    });

    return sortedDepartments.map((dept) => ({
        value: dept,
        label: `${dept} (${deptCounts.get(dept)})`,
    }));
}

/**
 * Filter companies based on selected department
 * @param selectedDepartment - The selected department
 * @param companies - Array of companies to filter
 * @returns Filtered array of companies that have the selected department
 */
export function filterCompaniesByDepartment(selectedDepartment: string | undefined, companies: Company[]) {
    if (!selectedDepartment) {
        return companies;
    }

    // Filter companies that have this department in their department field
    return companies.filter((company) => {
        const depts = company.department.split(',').map((dept: string) => dept.trim());
        return depts.includes(selectedDepartment);
    });
}

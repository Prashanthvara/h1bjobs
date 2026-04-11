"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Job } from "@/lib/jobTypes";
import { normalizeJobDepartments, normalizeJobKeywords, normalizeJobLocations, parseJobDate } from "@/lib/jobFilterUtils";
import { getDepartmentColor, getDepartmentTextColor } from "@/lib/departmentColors";
import { Company } from "@/lib/companyTypes";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface JobsListProps {
    jobs: Job[];
    error?: string | null;
    companies?: Company[];
}

function buildOrgLogoMap(companies: Company[]): Map<string, string> {
    const map = new Map<string, string>();
    companies.forEach((company) => {
        if (company.logo_url) {
            map.set(company.name.toLowerCase(), company.logo_url);
        }
    });
    return map;
}

function getOrgLogo(orgLogoMap: Map<string, string>, orgName: string | null): string | null {
    if (!orgName) return null;
    const key = orgName.toLowerCase();
    // Exact match
    if (orgLogoMap.has(key)) return orgLogoMap.get(key)!;
    // Partial match: check if company name is contained in org name or vice versa
    for (const [name, logo] of orgLogoMap) {
        if (key.includes(name) || name.includes(key)) return logo;
    }
    return null;
}

function getOrgInitial(orgName: string | null): string {
    if (!orgName) return "?";
    return orgName.charAt(0).toUpperCase();
}

function formatDate(value?: string | null) {
    if (!value) return "Date not listed";
    const parsed = parseJobDate(value);
    if (!parsed) return value;

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsed);
}

function isRecent(value?: string | null, days = 2) {
    if (!value) return false;
    const parsed = parseJobDate(value);
    if (!parsed) return false;
    const diffMs = Date.now() - parsed.getTime();
    return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}

function formatLocations(locations: string[]) {
    if (locations.length === 0) return "Location not listed";
    if (locations.length <= 2) return locations.join(" · ");
    return `${locations.slice(0, 2).join(" · ")} +${locations.length - 2} more`;
}

const PAGE_SIZE = 25;

function getPaginationRange(currentPage: number, totalPages: number) {
    const delta = 1;
    const range: number[] = [];

    for (let page = 1; page <= totalPages; page += 1) {
        if (page === 1 || page === totalPages || (page >= currentPage - delta && page <= currentPage + delta)) {
            range.push(page);
        }
    }

    const rangeWithDots: Array<number | "ellipsis"> = [];
    let previousPage: number | undefined;

    range.forEach((page) => {
        if (previousPage && page - previousPage > 1) {
            rangeWithDots.push("ellipsis");
        }
        rangeWithDots.push(page);
        previousPage = page;
    });

    return rangeWithDots;
}

export function JobsList({ jobs, error, companies = [] }: JobsListProps) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [jobs]);

    const orgLogoMap = useMemo(() => buildOrgLogoMap(companies), [companies]);

    const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pagedJobs = useMemo(() => {
        const startIndex = (safePage - 1) * PAGE_SIZE;
        return jobs.slice(startIndex, startIndex + PAGE_SIZE);
    }, [jobs, safePage]);

    const goToPage = useCallback((page: number) => {
        setCurrentPage(page);
        document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const paginationRange = useMemo(() => getPaginationRange(safePage, totalPages), [safePage, totalPages]);
    const isFirstPage = safePage === 1;
    const isLastPage = safePage === totalPages;

    if (error) {
        return (
            <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
                {error}
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-6 w-6 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-black">No jobs match your filters.</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or clearing filters.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {pagedJobs.map((job) => {
                    const locations = normalizeJobLocations(job.location);
                    const keywords = normalizeJobKeywords(job.keywords);
                    const departments = normalizeJobDepartments(job.department);
                    const visibleKeywords = keywords.slice(0, 5);
                    const remainingKeywords = keywords.length - visibleKeywords.length;
                    const sortedKeywords = [...visibleKeywords].sort((a, b) => a.length - b.length);
                    const recent = isRecent(job.job_posting_date);
                    const logoUrl = getOrgLogo(orgLogoMap, job.org);

                    return (
                        <Card key={job.job_id} className="border-gray-200 hover:shadow-sm transition-all">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex items-start md:items-center gap-3 md:gap-4">
                                    {/* Org logo */}
                                    <div className="shrink-0">
                                        {logoUrl ? (
                                            <div className="h-9 w-9 md:h-13 md:w-13 lg:h-15 lg:w-15 rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                                                <Image
                                                    src={logoUrl}
                                                    alt={`${job.org} logo`}
                                                    width={52}
                                                    height={52}
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-9 w-9 md:h-13 md:w-13 lg:h-15 lg:w-15 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                <span className="text-sm md:text-base lg:text-lg font-bold text-indigo-900">
                                                    {getOrgInitial(job.org)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-baseline gap-2.5">
                                                    <h4 className="font-semibold text-lg text-black leading-snug">
                                                        {job.job_title || "Job title not listed"}
                                                    </h4>
                                                    {recent && (
                                                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-0 shrink-0 font-semibold">
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-black mt-1.5 flex flex-wrap items-center gap-1.5">
                                                    <span className="font-medium">
                                                        {job.org || "Organization"}
                                                    </span>
                                                    <span className="text-gray-300">·</span>
                                                    <span>{formatLocations(locations)}</span>
                                                    <span className="text-gray-300">·</span>
                                                    <span>{formatDate(job.job_posting_date)}</span>
                                                </div>
                                                {(departments.length > 0 || visibleKeywords.length > 0) && (
                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        {departments.map((dept) => (
<Badge
                                                                 key={dept}
                                                                 variant="secondary"
                                                                 className="text-xs font-semibold border-0 py-1 px-2.5"
                                                                 style={{
                                                                     backgroundColor: getDepartmentColor(dept),
                                                                     color: getDepartmentTextColor(dept),
                                                                 }}
                                                             >
                                                                {dept}
                                                            </Badge>
                                                        ))}
                                                        {sortedKeywords.map((keyword) => (
                                                            <Badge
                                                                key={keyword}
                                                                variant="secondary"
                                                                className="text-xs font-medium bg-gray-100 text-black border-0 py-1 px-2.5"
                                                            >
                                                                {keyword}
                                                            </Badge>
                                                        ))}
                                                        {remainingKeywords > 0 && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs text-gray-500 font-medium bg-gray-100 border-0 py-1 px-2.5"
                                                            >
                                                                +{remainingKeywords} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="shrink-0">
                                                {job.url ? (
                                                    <Link href={job.url} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" className="h-9 px-6 text-sm font-bold shadow-sm w-full md:w-auto bg-black hover:bg-gray-800 text-white rounded-lg">
                                                            Apply
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button size="sm" className="h-9 px-6 text-sm font-bold shadow-sm w-full md:w-auto bg-black text-white rounded-lg" disabled>
                                                        Apply
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                disabled={isFirstPage}
                                onClick={() => {
                                    if (!isFirstPage) {
                                        goToPage(safePage - 1);
                                    }
                                }}
                                className={isFirstPage ? "pointer-events-none opacity-50" : undefined}
                            />
                        </PaginationItem>
                        {paginationRange.map((page, index) => (
                            <PaginationItem key={`${page}-${index}`}>
                                {page === "ellipsis" ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        isActive={page === safePage}
                                        onClick={() => goToPage(page)}
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                disabled={isLastPage}
                                onClick={() => {
                                    if (!isLastPage) {
                                        goToPage(safePage + 1);
                                    }
                                }}
                                className={isLastPage ? "pointer-events-none opacity-50" : undefined}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}

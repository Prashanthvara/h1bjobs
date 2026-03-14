"use client"

import { useEffect, useMemo, useState } from "react";
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
import { normalizeJobKeywords, normalizeJobLocations } from "@/lib/jobFilterUtils";
import Link from "next/link";

interface JobsListProps {
    jobs: Job[];
    isLoading?: boolean;
    error?: string | null;
}

function formatDate(value?: string | null) {
    if (!value) return "Date not listed";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsed);
}

function isRecent(value?: string | null, days = 2) {
    if (!value) return false;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return false;
    const diffMs = Date.now() - parsed.getTime();
    return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}

function formatLocations(locations: string[]) {
    if (locations.length === 0) return "Location not listed";
    if (locations.length <= 2) return locations.join(" • ");
    return `${locations.slice(0, 2).join(" • ")} +${locations.length - 2} more`;
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

export function JobsList({ jobs, isLoading, error }: JobsListProps) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [jobs]);

    const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pagedJobs = useMemo(() => {
        const startIndex = (safePage - 1) * PAGE_SIZE;
        return jobs.slice(startIndex, startIndex + PAGE_SIZE);
    }, [jobs, safePage]);

    const paginationRange = useMemo(() => getPaginationRange(safePage, totalPages), [safePage, totalPages]);
    const isFirstPage = safePage === 1;
    const isLastPage = safePage === totalPages;

    if (isLoading) {
        return (
            <div className="w-full flex flex-col gap-4">
                <h3 className="font-bold text-xl">Explore Jobs</h3>
                <div className="rounded-lg border border-gray-100 bg-white p-6 text-sm text-gray-500">
                    Loading jobs...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex flex-col gap-4">
                <h3 className="font-bold text-xl">Explore Jobs</h3>
                <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="w-full flex flex-col gap-4">
                <h3 className="font-bold text-xl">Explore Jobs</h3>
                <div className="rounded-lg border border-gray-100 bg-white p-6 text-sm text-gray-500">
                    No jobs match those filters.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <h3 className="font-bold text-xl">Explore Jobs</h3>
            <div className="flex flex-col gap-4">
                {pagedJobs.map((job) => {
                    const locations = normalizeJobLocations(job.location);
                    const keywords = normalizeJobKeywords(job.keywords);
                    const visibleKeywords = keywords.slice(0, 5);
                    const remainingKeywords = keywords.length - visibleKeywords.length;
                    const sortedKeywords = [...visibleKeywords].sort((a, b) => b.length - a.length);
                    const recent = isRecent(job.job_posting_date);

                    return (
                        <Card key={job.job_id} className="border-gray-100 hover:shadow-sm transition-all">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-base md:text-lg text-gray-900">
                                                {job.job_title || "Job title not listed"}
                                            </h4>
                                            {recent && (
                                                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-0">
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1 flex flex-wrap items-center gap-2">
                                            <span className="font-medium text-gray-700">
                                                {job.org || "Organization"}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span>{formatLocations(locations)}</span>
                                            <span className="text-gray-300">•</span>
                                            <span>{formatDate(job.job_posting_date)}</span>
                                        </div>
                                        {visibleKeywords.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2 xl:block xl:[column-width:14rem] 2xl:[column-width:16rem] xl:[column-gap:0.5rem]">
                                                {sortedKeywords.map((keyword) => (
                                                    <Badge
                                                        key={keyword}
                                                        variant="outline"
                                                        className="text-xs max-w-full truncate xl:mb-2 xl:[break-inside:avoid] xl:[page-break-inside:avoid] xl:[column-break-inside:avoid]"
                                                    >
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                                {remainingKeywords > 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs text-gray-500 max-w-full truncate xl:mb-2 xl:[break-inside:avoid] xl:[page-break-inside:avoid] xl:[column-break-inside:avoid]"
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
                                                <Button size="sm" className="h-9 px-4 text-sm font-semibold shadow-sm w-full md:w-auto">
                                                    Apply
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button size="sm" className="h-9 px-4 text-sm font-semibold shadow-sm w-full md:w-auto" disabled>
                                                Apply
                                            </Button>
                                        )}
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
                                href="#"
                                aria-disabled={isFirstPage}
                                tabIndex={isFirstPage ? -1 : undefined}
                                onClick={(event) => {
                                    event.preventDefault();
                                    if (!isFirstPage) {
                                        setCurrentPage(safePage - 1);
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
                                        href="#"
                                        isActive={page === safePage}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setCurrentPage(page);
                                        }}
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                aria-disabled={isLastPage}
                                tabIndex={isLastPage ? -1 : undefined}
                                onClick={(event) => {
                                    event.preventDefault();
                                    if (!isLastPage) {
                                        setCurrentPage(safePage + 1);
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

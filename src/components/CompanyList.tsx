"use client"

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { companies as globalCompanies, Company } from "@/lib/mockData";
import { filterCompaniesByLocation, filterCompaniesByRole, filterCompaniesByDepartment } from "@/lib/filterUtils";
import { MapPin, Globe, Linkedin, Instagram, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
    </svg>
);

interface CompanyListProps {
    selectedLocation?: string;
    selectedRole?: string;
    selectedDepartment?: string;
    companies?: Company[];
}

export function CompanyList({ selectedLocation, selectedRole, selectedDepartment, companies = globalCompanies }: CompanyListProps) {
    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

    let filteredCompanies = companies;
    filteredCompanies = filterCompaniesByLocation(selectedLocation, filteredCompanies);
    filteredCompanies = filterCompaniesByRole(selectedRole, filteredCompanies);
    filteredCompanies = filterCompaniesByDepartment(selectedDepartment, filteredCompanies);

    return (
        <div className="w-full flex flex-col gap-6">
            <h3 className="font-bold text-xl">Explore Companies</h3>
            <div className="flex flex-col gap-4">
                {filteredCompanies.map((company) => (
                    <Accordion
                        key={company.id}
                        type="single"
                        collapsible
                        className="w-full"
                    >
                        <AccordionItem value={company.id} className="border-none">
                            <Card
                                className="hover:shadow-md transition-all border-gray-100 overflow-visible relative group"
                                onMouseEnter={() => setHoveredCardId(company.id)}
                                onMouseLeave={() => setHoveredCardId(null)}
                            >
                                <CardContent className="p-4 md:p-6">
                                    {/* Mobile Layout (Variation 3 - Compact) */}
                                    <div className="flex flex-col gap-3 md:hidden">
                                        {/* Row 1: Header */}
                                        <div className="flex items-start gap-3">
                                            {/* Logo */}
                                            <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-50 border border-gray-100 flex overflow-hidden items-center justify-center">
                                                {company.logo_url && company.logo_url.startsWith("http") ? (
                                                    <Image
                                                        src={company.logo_url}
                                                        alt={`${company.name} logo`}
                                                        width={48}
                                                        height={48}
                                                        className="object-contain p-1.5"
                                                    />
                                                ) : (
                                                    <Building2
                                                        className="h-5 w-5 text-gray-400"
                                                        role="img"
                                                        aria-label={`${company.name} logo`}
                                                    />
                                                )}
                                            </div>
                                            {/* Name & Location */}
                                            <div className="flex flex-col min-w-0 justify-center h-12">
                                                <h4 className="font-bold text-base text-gray-900 truncate leading-tight">{company.name}</h4>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <MapPin className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{company.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Socials & Tags */}
                                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                                            {/* Social Icons */}
                                            <div className="flex items-center gap-3 shrink-0">
                                                {company.website && (
                                                    <Link href={company.website} target="_blank" className="text-gray-400 hover:text-blue-600">
                                                        <Globe className="h-4 w-4" />
                                                    </Link>
                                                )}
                                                {company.linkedin_url && (
                                                    <Link href={company.linkedin_url} target="_blank" className="text-gray-400 hover:text-blue-700">
                                                        <Linkedin className="h-4 w-4" />
                                                    </Link>
                                                )}
                                                {company.x_url && (
                                                    <Link href={company.x_url} target="_blank" className="text-gray-400 hover:text-black">
                                                        <XIcon className="h-4 w-4" />
                                                    </Link>
                                                )}
                                                {company.instagram_url && (
                                                    <Link href={company.instagram_url} target="_blank" className="text-gray-400 hover:text-pink-600">
                                                        <Instagram className="h-4 w-4" />
                                                    </Link>
                                                )}
                                            </div>

                                            <div className="w-px h-4 bg-gray-200 shrink-0"></div>

                                            {/* Tags */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {company.tags.split(',').map((tag, index) => (
                                                    <Badge variant="secondary" key={index} className="text-xs px-2 py-0.5 font-normal bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">
                                                        {tag.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Row 3: Stats & Action */}
                                        <div className="flex items-center justify-between mt-1 gap-4">
                                            {/* Stats */}
                                            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1.5 rounded-full text-xs font-medium shrink-0">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                <span>{company.h1b_approvals} Approvals</span>
                                            </div>

                                            {/* Apply Button */}
                                            {company.careers_url && (
                                                <Link href={company.careers_url} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" className="h-8 px-4 text-xs font-semibold shadow-sm">
                                                        Apply
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Desktop Layout (Preserved) */}
                                    <div className="hidden md:grid md:grid-cols-[75px_minmax(10px,1fr)_150px] md:auto-rows-min md:gap-x-6 md:gap-y-1 md:items-start">
                                        {/* Logo */}
                                        <div className="md:row-span-3 md:block">
                                            <div className="md:h-20 md:w-20 rounded-xl bg-gray-50 border border-gray-100 flex overflow-hidden shrink-0">
                                                {company.logo_url && company.logo_url.startsWith("http") ? (
                                                    <Image
                                                        src={company.logo_url}
                                                        alt={`${company.name} logo`}
                                                        width={80}
                                                        height={80}
                                                        className="object-contain p-2"
                                                    />
                                                ) : (
                                                    <Building2
                                                        className="md:h-8 md:w-8 text-gray-400 m-auto"
                                                        role="img"
                                                        aria-label={`${company.name} logo`}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Column 2 wrapper */}
                                        <div className="md:flex md:flex-col md:gap-2 md:col-start-2 md:row-start-1 md:row-span-3">
                                            <h4 className="font-bold text-lg text-gray-900 m-0">{company.name}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span>{company.location}</span>
                                                <span className="text-gray-400 mx-1">|</span>
                                                <div className="flex items-center gap-2">
                                                    {company.website && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link
                                                                        href={company.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 text-gray-400 hover:text-blue-600 focus:text-blue-600 transition-colors"
                                                                        aria-label="Visit company's website"
                                                                    >
                                                                        <Globe className="h-4 w-4" />
                                                                        <span className="sr-only">Website</span>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Visit website</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    {company.linkedin_url && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link
                                                                        href={company.linkedin_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 text-gray-400 hover:text-blue-700 focus:text-blue-700 transition-colors"
                                                                        aria-label="Visit company's LinkedIn profile"
                                                                    >
                                                                        <Linkedin className="h-4 w-4" />
                                                                        <span className="sr-only">LinkedIn</span>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Visit LinkedIn</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    {company.x_url && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link
                                                                        href={company.x_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 text-gray-400 hover:text-black focus:text-black transition-colors"
                                                                        aria-label="Visit company's X profile"
                                                                    >
                                                                        <XIcon className="h-4 w-4" aria-hidden="true" />
                                                                        <span className="sr-only">X</span>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Visit X</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    {company.instagram_url && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link
                                                                        href={company.instagram_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 text-gray-400 hover:text-pink-600 focus:text-pink-600 transition-colors"
                                                                        aria-label="Visit company's Instagram profile"
                                                                    >
                                                                        <Instagram className="h-4 w-4" />
                                                                        <span className="sr-only">Instagram</span>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Visit Instagram</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {company.tags.split(',').map((tag, index) => (
                                                    <Badge variant="outline" key={index} className="text-sm">
                                                        {tag.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* H1B Approvals */}
                                        <div className="flex items-center justify-center md:row-start-1 md:col-start-3">
                                            <div
                                                className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
                                                role="status"
                                                aria-label={`${company.h1b_approvals} H1B visa approvals`}
                                            >
                                                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                                <span>{company.h1b_approvals} H1B Approvals</span>
                                            </div>
                                        </div>

                                        {/* Apply Button */}
                                        <div className="flex items-center justify-center md:row-span-2 md:row-start-2 md:col-start-3 md:items-start">
                                            {company.careers_url && (
                                                <Link href={company.careers_url} target="_blank" rel="noopener noreferrer">
                                                    <Button
                                                        variant="default"
                                                        size="default"
                                                        className="focus:ring-2 focus:ring-blue-500"
                                                        aria-label={`Apply to jobs at ${company.name}`}
                                                    >
                                                        Apply
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>

                                {/* Read More Trigger - Positioned at bottom center, half over border */}
                                <div className={`absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 transition-opacity duration-200 z-10 ${hoveredCardId === company.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}>
                                    <AccordionTrigger className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 py-1.5 px-4 hover:no-underline bg-white border border-gray-200 rounded-full shadow-sm">
                                        <span>Read More</span>
                                    </AccordionTrigger>
                                </div>

                                {/* Accordion Content - Expanded Details */}
                                <AccordionContent>
                                    <div className="px-4 md:px-6 pb-6 pt-0">
                                        <div className="border-t border-gray-100 pt-4">
                                            {/* Main container with responsive grid for better flow on larger screens */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                                                {/* Left column: Exemption details – Prioritize this as it's the core value prop */}
                                                <div className="bg-blue-50 p-4 rounded-lg"> {/* Light background for emphasis */}
                                                    <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                                                        Why This Employer is H-1B Cap-Exempt
                                                    </h5>
                                                    <p className="text-gray-700">
                                                        {company.exemptiondetails} {/* Keep as-is, but frame it positively */}
                                                    </p>
                                                    <p className="mt-2 text-sm text-green-600 font-medium">
                                                        Benefit: Apply anytime without the lottery – more stability for your career!
                                                    </p> {/* User-resonant callout */}
                                                </div>

                                                {/* Right column: Opportunities – Group jobs and departments for a "job hunting" feel */}
                                                <div>
                                                    <div className="space-y-4 text-gray-600">

                                                        {/* Job Titles: Convert to bullets for scannability */}
                                                        <div>
                                                            <span className="font-medium block mb-1">Common Job Roles Sponsored:</span>
                                                            <ul className="list-disc pl-5 space-y-1">
                                                                {company.jobtitles.split(', ').map((title, index) => (
                                                                    <li key={index}>{title.trim()}</li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Departments: Similarly, use bullets or chips for multi-items */}
                                                        <div>
                                                            <span className="font-medium block mb-1">Departments Actively Hiring:</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {company.department.split(', ').map((dept, index) => (
                                                                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                                        {dept.trim()}
                                                                    </span>
                                                                ))} {/* Chips for a modern, tag-like feel */}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                            </div>

                                            {/* Optional footer for action – Resonates by guiding next steps */}
                                            <div className="mt-6 text-center text-sm text-gray-500">
                                                Interested? Check <a href={company.careers_url} className="text-blue-600 hover:underline">{company.name} Careers</a> page for open positions.
                                                <span className="text-gray-400 mx-1">|</span>
                                                <span className="font-medium">Sources: </span>
                                                <a href={company.source} className="text-blue-600 hover:underline">H-1BVisaJobs</a>
                                                <span className="text-gray-400 mx-1">|</span>
                                                <a href="https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub" className="text-blue-600 hover:underline">USCIS</a>
                                            </div> {/* Assume you have a careers_url; adjust as needed */}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    </Accordion>
                ))}
            </div>
        </div>
    );
}
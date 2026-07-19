import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SponsoredJob, SPONSORED_ELIGIBILITY_NOTE } from "@/lib/sponsoredJobs";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SponsoredJobCardProps {
    job: SponsoredJob;
}

export function SponsoredJobCard({ job }: SponsoredJobCardProps) {
    return (
        <Card className="relative border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-white hover:shadow-sm transition-all">
            <span className="absolute top-2.5 right-3.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 border border-indigo-200 rounded-md px-1.5 py-0.5">
                Sponsored
            </span>
            <CardContent className="p-4 md:p-5">
                <div className="flex items-start md:items-center gap-3 md:gap-4">
                    <div className="shrink-0">
                        <div className="h-9 w-9 md:h-13 md:w-13 lg:h-15 lg:w-15 rounded-lg border border-indigo-200 bg-white overflow-hidden flex items-center justify-center">
                            <Image
                                src={job.logoUrl}
                                alt={`${job.org} logo`}
                                width={52}
                                height={52}
                                className="object-contain p-1"
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="min-w-0">
                                <h4 className="font-semibold text-lg text-black leading-snug pr-20 md:pr-24">
                                    {job.title}
                                </h4>
                                <div className="text-sm text-black mt-1.5 flex flex-wrap items-center gap-1.5">
                                    <span className="font-medium">{job.org}</span>
                                    <span className="text-gray-300">·</span>
                                    <span>Remote</span>
                                    <span className="text-gray-300">·</span>
                                    <span className="font-semibold text-green-700 tabular-nums">{job.pay}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {job.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-xs font-medium bg-indigo-100 text-indigo-800 border-0 py-1 px-2.5"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                                    <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                                    {SPONSORED_ELIGIBILITY_NOTE}
                                </div>
                            </div>
                            <div className="shrink-0">
                                <Link href={job.url} target="_blank" rel="noopener noreferrer">
                                    <Button
                                        size="sm"
                                        className="h-9 px-6 text-sm font-bold shadow-sm w-full md:w-auto bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg"
                                    >
                                        Apply
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

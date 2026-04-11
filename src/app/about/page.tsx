import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
	alternates: {
		canonical: "/about",
	},
};

export default function About() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Header />
            <main className="flex flex-col items-center w-full">
                <div className="w-full max-w-4xl px-7 md:px-[150px] py-16">
                    <h1 className="text-4xl font-bold mb-8">About H1B Cap Exempt Jobs</h1>

                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p>
                            H1B Cap Exempt Jobs is an aggregation platform built to help international professionals find visa-sponsored roles without the H-1B lottery uncertainty. The H-1B cap makes hiring competitive, but cap-exempt employers—universities, nonprofits, and research institutions—can sponsor without the lottery. I bring those opportunities together in one searchable experience.
                        </p>

                        <p>
                            The site pairs employer insights (cap-exempt status, past approvals, departments, and hiring patterns) with aggregated job listings from those organizations. Whether you&apos;re an engineer, researcher, medical professional, or academic, the goal is the same: make visa-friendly roles easier to discover and faster to evaluate.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900">My Mission</h2>

                        <p>
                            My mission is to empower global talent by simplifying access to visa-sponsored opportunities and the employers most likely to support them. I believe candidates deserve clear, actionable information—so I focus on transparency, speed, and relevance rather than overwhelm.
                        </p>

                        <p>
                            I strive to make this information easy to navigate with filters for location, skills, and recency, while still offering rich employer context like approvals, departments, and exemption reasons. The result is a job-first experience backed by trustworthy employer data.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900">What I Do</h2>

                        <p>
                            I maintain an up-to-date set of cap-exempt employers and continuously aggregate visa-sponsored job postings from their public job boards. Each employer card highlights approval history, roles, departments, and exemption status; each job card focuses on fast, actionable signals like location, tags, and posting date.
                        </p>

                        <p>
                            Beyond the listings, I share guidance on visa sponsorship and how to evaluate employers. The platform evolves based on real user needs so it stays practical for anyone pursuing stable, lottery-free visa opportunities in the U.S.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900">FAQ</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">How do you evaluate visa eligibility?</h3>
                                <p className="text-gray-700">
                                    Each job gets a binary field called <span className="font-semibold">is_visa</span>. We start by assuming eligibility (set to 1), then look for evidence that the role is not eligible and set it to 0 if that evidence is clear.
                                </p>
                                <p className="text-gray-700 mt-3">
                                    Explicit language always wins. If the description says sponsorship is not available, we mark the role as ineligible. If it clearly states sponsorship is available or encouraged, we mark it as eligible.
                                </p>
                                <p className="text-gray-700 mt-3">
                                    When the posting is ambiguous, we use contextual signals. Part-time or seasonal roles are generally ineligible. Blue-collar roles (janitorial work, truck driving, and similar) are typically ineligible. Specialized or high-skill positions that require advanced degrees, STEM expertise, or specialized technical skills are more likely to be eligible.
                                </p>
                                <p className="text-gray-700 mt-3">
                                    We also assess the qualifications and requirements, industry norms (technology, finance, healthcare are more likely to sponsor), and role seniority, since higher-level or specialized roles tend to be more favorable for sponsorship.
                                </p>
                                <p className="text-gray-700 mt-3">
                                    The final decision weighs both explicit statements and contextual clues with a lawyer-like standard of reasoning. This is a best-effort assessment and not legal advice.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to explore cap-exempt roles?</h2>
                        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                            Browse hundreds of visa-sponsored positions at universities, research institutes, and non-profits.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-full shadow-sm hover:bg-slate-800 transition-colors"
                        >
                            Discover Open Roles
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

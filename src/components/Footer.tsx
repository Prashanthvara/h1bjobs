import Link from "next/link";

export function Footer() {
	return (
		<footer className="w-full border-t border-gray-100 bg-white">
			<div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
				<div className="text-sm text-gray-500">
					&copy; {new Date().getFullYear()} H1B Cap Exempt Jobs
				</div>
				<nav className="flex gap-6 text-sm text-gray-500">
					<Link href="/jobs" className="hover:text-gray-900 transition-colors">Jobs</Link>
					<Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
				</nav>
			</div>
		</footer>
	);
}

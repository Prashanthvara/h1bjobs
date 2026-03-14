import Link from "next/link";

export function Header() {
    return (
        <header className="w-full py-4 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                <Link href="/" className="font-bold text-xl tracking-tight hover:text-gray-700 transition-colors">
                    H1B Cap Exempt Jobs
                </Link>
                <nav className="flex gap-8 text-sm font-medium text-gray-600">
                    <Link href="/jobs" className="hover:text-black transition-colors">Jobs</Link>
                    <Link href="/about" className="hover:text-black transition-colors">About</Link>
                </nav>
            </div>
        </header>
    );
}

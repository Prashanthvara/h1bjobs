"use client"

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { parseJobUrlFilters, type JobUrlFilterValues } from "@/lib/jobUrlFilters";

interface JobUrlFiltersProps {
	/** Must be referentially stable (useCallback) — it is an effect dependency. */
	onFilters: (values: JobUrlFilterValues) => void;
}

/**
 * Applies `?org=` and `?range=` to the jobs feed. Renders nothing.
 *
 * This exists as its own component for one reason: `useSearchParams` opts its
 * whole subtree out of static prerendering, and `/` is statically generated
 * with a one-hour ISR window. Reading the params inside HomeClient would trade
 * the prerendered HTML this site's organic search depends on for two optional
 * query parameters. Kept as a leaf under <Suspense>, the deopt costs nothing
 * but this null render.
 *
 * The filters land in an effect rather than in initial state on purpose:
 * seeding state from the URL during render would make the client's first pass
 * disagree with the server's prerendered markup, which is a hydration error.
 */
export function JobUrlFilters({ onFilters }: JobUrlFiltersProps) {
	const searchParams = useSearchParams();

	useEffect(() => {
		onFilters(parseJobUrlFilters(new URLSearchParams(searchParams.toString())));
	}, [searchParams, onFilters]);

	return null;
}

"use client"

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { Job } from "@/lib/jobTypes";
import { buildAffinityFn, readAffinityProfile, type AffinityProfile } from "@/lib/jobAffinity";

/**
 * useLayoutEffect warns when it runs during server rendering, and there is
 * nothing for it to do there anyway — localStorage does not exist. This picks
 * the effect that is correct for each environment.
 */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The visitor's affinity function, or null when there is nothing stored.
 *
 * Read in a layout effect rather than a passive one on purpose. React flushes
 * layout effects after hydration but before the browser paints, so a returning
 * visitor never sees the unpersonalized order flash and then rearrange. A
 * passive effect would produce exactly that layout shift on every load.
 *
 * First-time visitors — most of the traffic, arriving from search — get null
 * here and skip client ranking entirely, which is what keeps their load free.
 */
export function useAffinityProfile(): ((job: Job) => number) | null {
	const [profile, setProfile] = useState<AffinityProfile | null>(null);

	useIsomorphicLayoutEffect(() => {
		const stored = readAffinityProfile();
		if (stored) setProfile(stored);
	}, []);

	return useMemo(() => (profile ? buildAffinityFn(profile) : null), [profile]);
}

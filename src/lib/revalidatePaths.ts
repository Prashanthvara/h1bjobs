/**
 * Every ISR route whose rendered output embeds Supabase data.
 *
 * `/` renders job cards plus company logos; `/companies` renders the employer
 * directory. Both are cached for a day, so a content update that misses either
 * path stays invisible to visitors until that window expires on its own.
 *
 * Add a route here whenever it starts rendering data from Supabase.
 */
export const REVALIDATE_PATHS = ["/", "/companies"] as const;

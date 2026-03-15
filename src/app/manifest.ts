import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "H1B Cap Exempt Jobs",
		short_name: "H1B Jobs",
		description:
			"Discover visa-sponsored roles at cap-exempt universities, research institutes, and non-profits.",
		start_url: "/",
		display: "standalone",
		theme_color: "#0F172A",
		background_color: "#FFFFFF",
		icons: [
			{
				src: "/favicons/favicon-light-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/favicons/favicon-light-512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/favicons/favicon-dark-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/favicons/favicon-dark-512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}

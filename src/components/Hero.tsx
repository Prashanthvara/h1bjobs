export function Hero({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle: string;
	children?: React.ReactNode;
}) {
	return (
		<section className="w-full pt-7 pb-8 md:pt-10 md:pb-12 flex flex-col items-center justify-center text-center px-4 bg-white">
			<h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-black mb-4 max-w-3xl leading-tight">
				{title}
			</h1>
			<h2 className="text-base md:text-lg text-black max-w-2xl mb-8 font-medium">
				{subtitle}
			</h2>
			{children}
		</section>
	);
}

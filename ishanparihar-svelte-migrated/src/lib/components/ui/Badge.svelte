<script lang="ts">
	import { cn } from "$lib/utils";

	type BadgeVariants = "default" | "secondary" | "destructive" | "outline" | "active" | "inactive" | "pending" | "success" | "warning" | "error";

	interface Props {
		variant?: BadgeVariants;
		class?: string;
		children?: any;
		asChild?: boolean;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		variant = "default",
		class: className = "",
		children,
		asChild = false,
		onclick,
		...restProps
	}: Props = $props();

	function badgeVariants(variant: BadgeVariants): string {
		const baseClasses = "inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0";
		
		const variantClasses = {
			default: "border-transparent bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90",
			secondary: "border-transparent bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700",
			destructive: "border-transparent bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90",
			outline: "border-black text-black dark:border-white dark:text-white",
			active: "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black",
			inactive: "border-neutral-300 bg-transparent text-neutral-700 dark:border-neutral-700 dark:text-neutral-300",
			pending: "border-neutral-400 bg-transparent text-neutral-800 dark:border-neutral-600 dark:text-neutral-200",
			success: "border-black bg-white text-black dark:border-white dark:bg-black dark:text-white",
			warning: "border-dashed border-black text-black dark:border-white dark:text-white",
			error: "border-2 border-black text-black dark:border-white dark:text-white"
		};

		return cn(baseClasses, variantClasses[variant]);
	}

	function handleClick(event: MouseEvent) {
		if (onclick) {
			onclick(event);
		}
	}

	const badgeClasses = $derived(badgeVariants(variant));
	const finalClasses = $derived(cn(badgeClasses, className));
</script>

{#if asChild}
	{@render children?.({ class: finalClasses, onclick: handleClick, ...restProps })}
{:else}
	<div
		class={finalClasses}
		onclick={handleClick}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
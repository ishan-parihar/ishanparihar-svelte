<script lang="ts">
	import { cn } from "$lib/utils";
	import { createEventDispatcher } from "svelte";

	type ButtonVariants = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "cosmic";
	type ButtonSizes = "default" | "sm" | "lg" | "icon";

	interface Props {
		variant?: ButtonVariants;
		size?: ButtonSizes;
		class?: string;
		disabled?: boolean;
		type?: "button" | "submit" | "reset";
		onclick?: (event: MouseEvent) => void;
		children?: any;
		asChild?: boolean;
	}

	let {
		variant = "default",
		size = "default",
		class: className = "",
		disabled = false,
		type = "button",
		onclick,
		children,
		asChild = false,
		...restProps
	}: Props = $props();

	const dispatch = createEventDispatcher();

	function buttonVariants(variant: ButtonVariants, size: ButtonSizes): string {
		const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50";
		
		const variantClasses = {
			default: "rounded-none bg-neutral-900 text-white border border-neutral-900 hover:bg-neutral-800 transition-all duration-200 dark:bg-white dark:text-black dark:border-white dark:hover:bg-white/90",
			destructive: "rounded-none bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 dark:bg-red-700 dark:border-red-700 dark:hover:bg-red-800 dark:hover:border-red-800",
			outline: "rounded-none border border-neutral-800 bg-transparent text-neutral-800 hover:bg-neutral-100 dark:border-white dark:text-white dark:hover:bg-white/10",
			secondary: "rounded-none bg-neutral-100 text-neutral-800 border border-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700",
			ghost: "rounded-none text-neutral-800 hover:bg-neutral-100 dark:text-white dark:hover:bg-white/10",
			link: "rounded-none text-neutral-800 underline-offset-4 hover:underline dark:text-white",
			cosmic: "rounded-none bg-neutral-900 text-white border border-neutral-900 hover:bg-neutral-800 transition-all duration-200 dark:bg-white dark:text-black dark:border-white dark:hover:bg-white/90"
		};

		const sizeClasses = {
			default: "h-9 px-4 py-2 rounded-none",
			sm: "h-8 px-3 text-xs rounded-none",
			lg: "h-10 px-8 rounded-none",
			icon: "h-9 w-9 rounded-none"
		};

		return cn(
			baseClasses,
			variantClasses[variant],
			sizeClasses[size],
			"rounded-none"
		);
	}

	function handleClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			return;
		}
		
		if (onclick) {
			onclick(event);
		}
		
		dispatch("click", event);
	}

	const buttonClasses = $derived(buttonVariants(variant, size));
	const cleanedClassName = $derived(className?.replace(/rounded-\w+/g, "") || "");
	const finalClasses = $derived(cn(buttonClasses, cleanedClassName));
</script>

{#if asChild}
	{@render children?.({ class: finalClasses, onclick: handleClick, disabled, type, ...restProps })}
{:else}
	<button
		class={finalClasses}
		{disabled}
		{type}
		onclick={handleClick}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</button>
{/if}
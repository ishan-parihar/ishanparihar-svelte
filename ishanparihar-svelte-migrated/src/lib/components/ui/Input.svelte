<script lang="ts">
	import { cn } from "$lib/utils";
	import { onMount } from "svelte";

	interface Props {
		type?: string;
		class?: string;
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		value?: string;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
		style?: string;
		[key: string]: any;
	}

 	let {
 		type = "text",
 		class: className = "",
 		placeholder,
 		disabled = false,
 		readonly = false,
 		required = false,
 		value = $bindable(),
 		oninput,
 		onchange,
 		onfocus,
 		onblur,
 		style,
 		...restProps
 	}: Props = $props();

	let isMounted = $state(false);
	let inputElement: HTMLInputElement;

	onMount(() => {
		isMounted = true;
	});

	// Create a version of props without style if not mounted yet
	const safeProps = $derived(!isMounted && style ? { ...restProps, style: undefined } : restProps);

 	function handleInput(event: Event) {
 		const target = event.target as HTMLInputElement;
 		value = target.value;
 		if (oninput) {
 			oninput(event);
 		}
 	}

	function handleChange(event: Event) {
		if (onchange) {
			onchange(event);
		}
	}

	function handleFocus(event: FocusEvent) {
		if (onfocus) {
			onfocus(event);
		}
	}

	function handleBlur(event: FocusEvent) {
		if (onblur) {
			onblur(event);
		}
	}

	const inputClasses = $derived(cn(
		"flex h-9 w-full rounded-none border border-neutral-300 bg-white px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-neutral-500 text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-700 dark:bg-black dark:text-white dark:placeholder:text-neutral-400 dark:focus-visible:ring-primary dark:focus-visible:border-primary",
		className
	));
</script>

<input
	bind:this={inputElement}
	{type}
	{placeholder}
	{disabled}
	{readonly}
	{required}
	{value}
	class={inputClasses}
	oninput={handleInput}
	onchange={handleChange}
	onfocus={handleFocus}
	onblur={handleBlur}
	aria-invalid={restProps["aria-invalid"]}
	{...safeProps}
/>
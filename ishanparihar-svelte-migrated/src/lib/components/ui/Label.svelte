<script lang="ts">
	import { cn } from "$lib/utils";

	interface Props {
		class?: string;
		for?: string;
		children?: any;
		onclick?: (event: MouseEvent) => void;
	}

	let { 
		class: className = "", 
		for: htmlFor, 
		children, 
		onclick,
		...restProps 
	}: Props = $props();

	function handleClick(event: MouseEvent) {
		if (onclick) {
			onclick(event);
		}
	}

	const labelClasses = $derived(cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	));
</script>

<label
	class={labelClasses}
	for={htmlFor}
	onclick={handleClick}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</label>
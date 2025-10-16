<script lang="ts">
	import { cn } from "$lib/utils";

	interface Props {
		class?: string;
		children?: any;
	}

	let { class: className = "", children, ...restProps }: Props = $props();
</script>

<div class={cn("p-4 bg-transparent text-foreground rounded-none border border-border shadow-none", className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
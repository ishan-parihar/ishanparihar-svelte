<script lang="ts">
	import { cn } from "$lib/utils";

	interface Props {
		class?: string;
		children?: any;
	}

	let { class: className = "", children, ...restProps }: Props = $props();
</script>

<div class={cn("text-sm text-neutral-500 dark:text-neutral-400 font-ui", className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
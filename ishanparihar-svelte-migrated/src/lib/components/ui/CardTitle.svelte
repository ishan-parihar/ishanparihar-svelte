<script lang="ts">
	import { cn } from "$lib/utils";

	interface Props {
		class?: string;
		children?: any;
	}

	let { class: className = "", children, ...restProps }: Props = $props();
</script>

<div class={cn("text-xl font-ui font-semibold leading-none tracking-tight text-foreground", className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
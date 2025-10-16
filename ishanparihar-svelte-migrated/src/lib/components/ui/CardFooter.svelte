<script lang="ts">
	import { cn } from "$lib/utils";

	interface Props {
		class?: string;
		children?: any;
	}

	let { class: className = "", children, ...restProps }: Props = $props();
</script>

<div class={cn("flex items-center p-6 pt-0", className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	// Temporarily disabled CSS import
	// import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

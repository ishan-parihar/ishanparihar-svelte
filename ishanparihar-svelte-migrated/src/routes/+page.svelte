<script lang="ts">
	import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Label, Badge } from '$lib/components/ui';
	
	let inputValue = $state('');
	let buttonClickCount = $state(0);
	
	function handleButtonClick() {
		buttonClickCount++;
	}
</script>

<div class="container mx-auto p-8 space-y-8">
	<header class="text-center space-y-4">
		<h1 class="text-4xl font-bold">Svelte Migration - UI Components Test</h1>
		<p class="text-lg text-gray-600">Testing migrated React components in Svelte 5</p>
	</header>

	<section class="space-y-6">
		<h2 class="text-2xl font-semibold">Button Components</h2>
		<div class="flex flex-wrap gap-4">
			<Button variant="default" onclick={handleButtonClick}>
				Default Button (Clicked: {buttonClickCount})
			</Button>
			<Button variant="secondary">Secondary Button</Button>
			<Button variant="outline">Outline Button</Button>
			<Button variant="ghost">Ghost Button</Button>
			<Button variant="destructive">Destructive Button</Button>
		</div>
	</section>

	<section class="space-y-6">
		<h2 class="text-2xl font-semibold">Badge Components</h2>
		<div class="flex flex-wrap gap-4">
			<Badge>Default Badge</Badge>
			<Badge variant="secondary">Secondary Badge</Badge>
			<Badge variant="destructive">Destructive Badge</Badge>
			<Badge variant="outline">Outline Badge</Badge>
			<Badge variant="success">Success Badge</Badge>
		</div>
	</section>

	<section class="space-y-6">
		<h2 class="text-2xl font-semibold">Input Components</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="space-y-2">
				<Label for="name-input">Name Input</Label>
				<Input id="name-input" placeholder="Enter your name" bind:value={inputValue} />
			</div>
			<div class="space-y-2">
				<Label for="email-input">Email Input</Label>
				<Input id="email-input" type="email" placeholder="Enter your email" />
			</div>
		</div>
		{#if inputValue}
			<p class="text-sm text-gray-600">You typed: {inputValue}</p>
		{/if}
	</section>

	<section class="space-y-6">
		<h2 class="text-2xl font-semibold">Card Components</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Basic Card</CardTitle>
					<CardDescription>This is a basic card component migrated from React.</CardDescription>
				</CardHeader>
				<CardContent>
					<p class="text-gray-700">This is the content area of the card. It can contain any content you want.</p>
				</CardContent>
				<CardFooter>
					<Button size="sm">Action</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Another Card</CardTitle>
					<CardDescription>Testing card functionality with Svelte 5.</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-2">
						<Badge variant="active">Active</Badge>
						<Badge variant="pending">Pending</Badge>
					</div>
				</CardContent>
				<CardFooter>
					<Button variant="outline">Cancel</Button>
				</CardFooter>
			</Card>
		</div>
	</section>
</div>
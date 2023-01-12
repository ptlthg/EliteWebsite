<script lang="ts">
	import CollectionBar from './collectionbar.svelte';

	export let collections: {
		name: string | undefined;
		value: number;
		minionTierField: number;
		weight: number;
		tier: number;
		maxTier: number;
		key: string;
	}[];
	export let ranks: Record<string, number> | undefined;

	let list = collections?.sort((a, b) => b.weight - a.weight) ?? [];

	let weightSort = true;
	function swap() {
		weightSort = !weightSort;

		list = weightSort
			? collections?.sort((a, b) => b.weight - a.weight)
			: collections?.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);
	}
</script>

<section class="py-4">
	<div class="flex justify-center align-middle">
		<div class="w-full">
			<button
				class="ml-2 -mt-4 py-1 rounded-md w-20 bg-gray-100 dark:bg-zinc-800 whitespace-nowrap text-sm hover:font-semibold"
				on:click={swap}>{weightSort ? 'Weight ↓' : 'A-Z ↓'}</button
			>
			{#each list as item (item.name)}
				<CollectionBar {...item} rank={ranks?.[item.key]} />
			{/each}
		</div>
	</div>
</section>

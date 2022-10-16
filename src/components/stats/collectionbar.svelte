<script lang="ts">
	import crops from '$lib/collections';
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import Minion from './minion.svelte';

	export let name: string | undefined;
	export let value: number;
	export let weight: number;
	export let minionTierField: number;

	const crop = name ? crops.crops[name] : undefined;
	let index = 0;
	let tier = 0;
	let maxTier = 0;

	const cropArray = Object.values(PROPER_CROP_NAME).sort((a, b) => a?.localeCompare(b ?? '') ?? 0);

	if (crop && name) {
		for (let i = crop.length - 1; i >= 0; i--) {
			if (value >= crop[i]) {
				tier = i + 1;
				break;
			}
		}

		maxTier = crop.length;

		// Get index of where the crop was in crops.crops
		index = cropArray.indexOf(name);
	}
</script>

<div class="p-1 m-1 flex gap-4 w-full">
	<div class="bg-gray-100 rounded-lg flex justify-center align-middle w-full">
		<div class="crop-container p-1 md:p-3">
			<div class="crop" style="background-position: 0% {1000 - 100 * index}%;" />
		</div>
		<div class="flex flex-col gap-2 w-[100%] px-3 py-1">
			<div class="flex justify-between">
				<h1 class="text-2xl">{value.toLocaleString()} <span class="text-lg">{name}</span></h1>
				<h1>
					<span class="text-lg text-gray-600">{tier} / {maxTier}</span>
					<span class="ml-2 font-semibold text-xl">{weight.toLocaleString()}</span>
				</h1>
			</div>
			<div class="segments h-full max-h-8 flex flex-row gap-[0.15rem] md:gap-1">
				{#each Array.from({ length: maxTier }) as _, i}
					<div class="w-1/6 h-[100%] {i < tier ? 'bg-green-500' : 'bg-gray-200'}" />
				{/each}
			</div>
		</div>
	</div>
	<Minion name={name ?? ''} {index} tierField={minionTierField} />
</div>

<style lang="postcss">
	.crop-container {
		@apply flex align-middle justify-center;
		width: 6vw !important;
		height: 6vw;
		aspect-ratio: 1 / 1;
	}
	.crop {
		@apply rounded-lg;
		display: inline-block;
		background-image: url(/images/cropatlas.png);
		width: 100%;
		aspect-ratio: 1;
		background-size: 200% 1000%;
	}

	/* Mobile styles */
	@media (max-width: 640px) {
		.crop-container {
			width: 8vw;
			height: 8vw;
		}
	}

	/* Round left corners on first child of .segments */
	.segments > :first-child {
		border-top-left-radius: 0.25rem;
		border-bottom-left-radius: 0.25rem;
	}

	/* Round right corners on last child of .segments */
	.segments > :last-child {
		border-top-right-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
	}
</style>
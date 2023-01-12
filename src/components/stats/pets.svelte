<script lang="ts">
	import type { PetList } from "$lib/skyblock";

	export let pets: PetList;
</script>

<section class="py-4">
	{#each pets as pet (pet)}
		<p>{pet.type}</p>
	{/each}
</section>

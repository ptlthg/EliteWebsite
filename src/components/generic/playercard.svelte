<script lang="ts">
	import type { User } from '$db/models/users';
	import { goto } from '$app/navigation';

	export let user: Partial<User>;
</script>

<section
	class="bg-gray-100 dark:bg-zinc-800 rounded-lg p-2 flex items-center justify-center flex-col"
	on:click={() => goto(`/stats/${user.ign}`)}
>
	<img class="w-24 h-24" src={`https://mc-heads.net/head/${user.uuid}`} alt={`${user.ign}'s player head.`} />
	<h1 class="text-center text-body-md p-1">{user.ign}</h1>
</section>

<script lang="ts">
	import { PUBLIC_PUZZLE_HOST } from '$env/static/public';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';

	import { Game, GamePhase } from '$lib/models/Game';

	import GameBoard from '$lib/components/game/GameBoard.svelte';

	let game: Game | null = null;
	let loadFailed = false;

	onMount(async () => {
		try {
			// TODO: safer way to generate YYYY-MM-DD of target timezone
			const puzzlePathToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
			const response = await fetch(`${PUBLIC_PUZZLE_HOST}/${puzzlePathToday}.json`);
			if (response.ok) {
				const puzzle = await response.json();
				game = new Game(puzzle);
			} else {
				loadFailed = true;
				console.error(`Failed to fetch: ${response.statusText}`);
			}
		} catch (error) {
			loadFailed = true;
			console.error(`Exception fetching JSON: ${error}`);
		}
	});
</script>

{#if game}
	<GameBoard {game}></GameBoard>
{:else if loadFailed}
	<div role="alert" class="w-auto p-8 m-4 text-white shadow-lg alert alert-error">
		<Icon icon="material-symbols-light:error-outline" class="text-4xl shrink-0" />
		<div>
			<h3 class="text-lg font-bold">Fehler beim Laden</h3>
			<div class="text-sm">
				Beim Laden des heutigen Rätsels ist leider ein Fehler aufgetreten. Bitte versuche es später
				oder morgen noch einmal.
			</div>
		</div>
	</div>
{:else}
	<div class="grid w-full bg-gray-200 rounded-none h-2/3 place-content-center">
		<span class="w-36 loading loading-ring"></span>
	</div>
	<div class="h-1/3 skeleton bg-gray-300 rounded-none grid grid-cols-2 grid-rows-[1fr,2fr]">
		<div class="bg-gray-400 opacity-30"></div>
		<div class="bg-gray-400 opacity-50"></div>
		<div
			class="grid text-3xl font-light tracking-tighter text-gray-400 uppercase col-span-full place-content-center font-condensed"
		>
			Lade heutiges Rätsel
		</div>
	</div>
	Loading...
{/if}

<script lang="ts">
	import Couple from './Couple.svelte';

	import type { Word as WordType } from '$lib/models/Word';
	import Word from './Word.svelte';
	import Icon, { iconLoaded } from '@iconify/svelte';
	import GuessButton from './GuessButton.svelte';

	// TODO: import riddle dynamically
	import { riddle } from '../today';
	import { WordState } from '$lib/models/Word';
	import { Game, GamePhase } from '$lib/models/Game';
	import { derived, get, writable } from 'svelte/store';

	let game:Game = new Game(riddle);

	// derived stores to determine the state of the game a bit easier
	let { selectedEmpty, selectedMaxed, uncoupledWords, coupledGroups, mistakesRemaining , percentage } = game.derived;

	// TODO: improve split of game area for better responsiveness
	const unit = 100 / (Math.ceil(game.wordCount / 2) + 4);
	
	function selectWord(event: CustomEvent) {
		if (!game.select(event.detail as WordType)) event.preventDefault();
	}

	function deselectWord(event: CustomEvent) {
		if (!game.deselect(event.detail as WordType)) event.preventDefault();
	}

	function clear(event: Event) {
		game.clear()
	}

	function couple(event: Event) {
		game.couple()
	}
</script>
<section class="h-full overflow-hidden">
	<!-- #region WORDS -->
	{#if $game.phase == GamePhase.last}
		<section
			class="grid px-4 text-3xl font-light text-center h-1/4 place-content-center font-condensed text-info"
			style="height: {unit * 3}%"
		>
			Kannst du auch die Gemeinsamkeit der letzten 4 Begriffe erraten?
		</section>
	{:else if $game.phase != GamePhase.lost}
		<ul
			class="grid grid-cols-2 group h-2/3"
			style="height: {Math.ceil(game.wordCount / 2) * unit * (1 - $percentage)}%"
		>
			{#each $uncoupledWords as word}
				<Word
					{word}
					state={$game.selected.includes(word) ? WordState.selected : WordState.normal}
					selectable={!$selectedMaxed}
					on:select={selectWord}
					on:deselect={deselectWord}
				/>
			{/each}
		</ul>
	{/if}
	<!-- #endregion -->
	
	<!-- #region GUESS -->
	{#if $game.phase == GamePhase.won}
		<section
			class="grid px-4 text-3xl font-light text-center h-1/3 place-content-center font-condensed text-success"
			style="height: {unit * 4}%"
		>
			Herzlichen Glückwunsch, du hast gewonnen!
		</section>
	{:else if $game.phase == GamePhase.lost}
		<section
			class="grid px-4 text-3xl font-light text-center h-1/3 place-content-center font-condensed text-error"
			style="height: {unit * 4}%"
		>
			Schade, heute nicht geschafft.
		</section>
	{:else}
		{#if $game.phase !== GamePhase.last}
			<section style="height: {unit * 0.15}%"></section>
			<section
				class="grid justify-between grid-cols-2 text-xl font-light text-center align-middle bg-dark text-light place-content-center font-condensed"
				class:bg-red={$mistakesRemaining == 1 && $game.phase !== GamePhase.mistaken}
				style="height: {unit * 0.7}%"
			>
				{#if $mistakesRemaining == 1}
					<span class="col-span-2">Vorsicht, letzter Versuch!</span>
				{:else}
					<span>Verbleibende Versuche:</span>
					<span>{'⬤ '.repeat($mistakesRemaining)}</span>
				{/if}
			</section>
		{/if}
		<section
			class="h-1/3 bg-light grid grid-cols-2 grid-rows-[1fr,2fr] font-light"
			style="height: {unit * 3}%"
		>
			{#if $game.phase !== GamePhase.last}
				<GuessButton
					disabled={$selectedEmpty}
					btnClass="btn-warning"
					icon="material-symbols-light:close"
					on:click={clear}>Leeren</GuessButton
				>
			{/if}
			{#if $game.phase == GamePhase.mistaken}
				<div class="grid text-2xl font-light bg-red text-light place-content-center font-condensed">
					{#if game.getMaxCorrelation() === 3}
						Einer ist falsch
					{:else if game.getMaxCorrelation() == 2}
						2 Worte richtig
					{:else}
						Kein Zusammenhang
					{/if}
				</div>
			{:else}
				<GuessButton
					disabled={!$selectedMaxed}
					btnClass="btn-info{$game.phase === GamePhase.last ? ' col-span-full' : ''}"
					icon="system-uicons:chain"
					iconRight
					on:click={couple}>Kuppeln</GuessButton
				>
			{/if}
			<ul
				class="grid grid-cols-2 grid-rows-2 text-2xl font-light tracking-tighter col-span-full font-condensed"
			>
				{#each $game.selected as word}
					<Word
						word={word}
						state={$game.phase == GamePhase.last ? WordState.lastGroup : WordState.selection}
						on:deselect={deselectWord}
					/>
				{/each}
				{#if $selectedEmpty}
					<li
						class="grid px-12 text-center transition-all place-content-center col-span-full row-span-full"
					>
						{#if $percentage > 0}
							Sehr gut, wähle die nächsten 4 Begriffe.
						{:else}
							Wähle vier Begriffe, die etwas gemeinsam haben, und drücke dann auf KUPPELN.
						{/if}
					</li>
				{/if}
			</ul>
		</section>
	{/if}
	<!-- #endregion -->
	{#if [GamePhase.playing,GamePhase.mistaken].includes($game.phase) }
		<section style="height: {unit * 0.15}%"></section>
	{/if}
	<!-- #region COUPLED -->
	{#if $game.phase == GamePhase.lost}
		{#each Object.keys(game.groups) as group}
			{#if !$coupledGroups.includes(group)}
				<Couple group={game.getGroupById(group)} coupled={false} height={unit * 2}></Couple>
			{/if}
		{/each}
	{/if}
	{#each $coupledGroups as group}
		<Couple group={game.getGroupById(group)} coupled={true} height={unit * 2}></Couple>
	{/each}
	<!-- #endregion -->

</section>

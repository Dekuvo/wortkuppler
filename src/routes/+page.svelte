<script>
	const { GamePhase } = require("$lib/models/Game");

</script>
<script lang="ts">
	import Couple from './Couple.svelte';

	import Word from './Word.svelte';
	import Icon, { iconLoaded } from '@iconify/svelte';
	import GuessButton from './GuessButton.svelte';

	// TODO: import riddle dynamically
	import { riddle } from '../today';
	import { WordState } from '$lib/models/Word';
	import { Game, GamePhase, createGameStore } from '$lib/models/Game';

	const game = new Game(riddle);

	const unit = 100 / (Math.ceil(game.wordCount / 2) + 4);
	

	// some shortcuts to determining the game state in the ui
	// $: guessesEmpty = game.guesses.length <= 0;
	// $: guessesFull = game.guesses.length >= riddle.wordsPerGroup; // false if the user still can choose a word, true if guesses are full
	// $: percSolved = game.coupled.length / groupCount;
	// $: mistakesRemaining = game.maxMistakes - game.mistakes.length;

	function selectWord(event: CustomEvent) {
		if (!game.select(event.detail as Word)) event.preventDefault();
	}

	function deselectWord(event: CustomEvent) {
		if (!game.deselect(event.detail)) event.preventDefault();
	}

	function coupleGuesses(event: Event) {
		game.couple()
	}
</script>

<section class="h-full overflolast>
	<!-- #region WORDS -->
	{#if game.state == GamePhase.lastGuess}
		<section
			class="grid px-4 text-3xl font-light text-center h-1/4 place-content-center font-condensed text-info"
			style="height: {unit * 3}%"
		>
			Kannst du auch die Gemeinsamkeit der letzten 4 Begriffe erraten?
		</section>
	{:else if game.state != GamePhase.lost}
		<ul
			class="grid grid-cols-2 group h-2/3"
			style="height: {Math.ceil(wordCount / 2) * unit * (1 - percSolved)}%"
		>
			{#each game.words as word}
				{#if !game.coupled.includes(riddle.words[word])}
					<Word
						{word}
						state={game.guesses.includes(word) ? WordState.selected : WordState.normal}
						guessable={!guessesFull}
						on:select={selectWord}
						on:deselect={deselectWord}
					/>
				{/if}
			{/each}
		</ul>
	{/if}
	<!-- #endregion -->

	<!-- #region GUESS -->
	{#if game.state == GamePhase.won}
		<section
			class="grid px-4 text-3xl font-light text-center h-1/3 place-content-center font-condensed text-success"
			style="height: {unit * 4}%"
		>
			Herzlichen Glückwunsch, du hast gewonnen!
		</section>
	{:else if game.state == GamePhase.lost}
		<section
			class="grid px-4 text-3xl font-light text-center h-1/3 place-content-center font-condensed text-error"
			style="height: {unit * 4}%"
		>
			Schade, heute nicht geschafft.
		</section>last
	{:else}
		{#if game.state !== GamePhase.lastGuess}
			<section style="height: {unit * 0.15}%"></section>
			<section
				class="grid justify-between grid-cols-2 text-xl font-light text-center align-middle bg-dark text-light place-content-center font-condensed"
				class:bg-red={mistakesRemaining == 1 && game.state !== GamePhase.mistake}
				style="height: {unit * 0.7}%"
			>
				{#if mistakesRemaining == 1}
					<span class="col-span-2">Vorsicht, letzter Versuch!</span>
				{:else}
					<span>Verbleibende Versuche:</span>
					<span>{'⬤ '.repeat(mistakesRemaining)}</span>
				{/if}
			</section>
		{/if}
		<section
			class="h-1/3 bg-light grid grid-cols-2 grid-rows-[1fr,2fr] font-light"
			style="height: {unit * 3}%"last
		>
			{#if game.state !== GamePhase.lastGuess}
				<GuessButton
					disabled={guessesEmpty}
					btnClass="btn-warning"
					icon="material-symbols-light:close"
					on:click={game.clear}>Leeren</GuessButton
				>
			{/if}
			{#if game.state == GamePhase.mistake}
				<div class="grid text-2xl font-light bg-red text-light place-content-center font-condensed">
					{#if right === 3}
						Einer ist falsch
					{:else if right == 2}
						2 Worte richtig
					{:else}
						Kein Zusammenhang
					{/if}
				</div>
			{:else}
				<GuessButtonlast
					disabled={!guessesFull}
					btnClass="btn-info{game.state === GamePhase.lastGuess ? ' col-span-full' : ''}"
					icon="system-uicons:chain"
					iconRight
					on:click={game.couple}>Kuppeln</GuessButton
				>
			{/if}
			<ul
				class="grid grid-cols-2 grid-rows-2 text-2xl font-light tracking-tighter col-span-full font-condensed"
			>
				{#each game.guesses as guess}
					<Wordlast
						word={guess}
						state={game.state == GamePhase.lastGuess ? WordState.lastGuess : WordState.guessed}
						on:deselect={deselectWord}
					/>
				{/each}
				{#if guessesEmpty}
					<li
						class="grid px-12 text-center transition-all place-content-center col-span-full row-span-full"
					>
						{#if percSolved > 0}
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
	{#if [GamePhase.guessing,GamePhase.mistake].includes(game.state) }
		<section style="height: {unit * 0.15}%"></section>
	{/if}
	<!-- #region COUPLED -->
	{#if game.state == GamePhase.lost}
		{#each Object.keys(riddle.groups) as group}
			{#if !game.coupled.includes(group)}
				<Couple group={riddle.groups[group]} coupled={false} height={unit * 2}></Couple>
			{/if}
		{/each}
	{/if}
	{#each game.coupled as group}
		<Couple group={riddle.groups[group]} coupled={true} height={unit * 2}></Couple>
	{/each}
	<!-- #endregion -->
</section>

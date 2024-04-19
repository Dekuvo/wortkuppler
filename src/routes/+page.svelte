<script lang="ts">
	import Couple from './Couple.svelte';

	import Word from './Word.svelte';
	import Icon, { iconLoaded } from '@iconify/svelte';
	import GuessButton from './GuessButton.svelte';

	// TODO: import riddle dynamically
	import { riddle } from '../today';
	import { WordPlace, WordState } from '$lib/models/Word';
	import type Game from '$lib/models/Game';
	import { GameState } from '$lib/models/Game';
	import { tick } from 'svelte';

	for (const group in riddle.groups) {
		riddle.groups[group].words = [];
	}

	// for easier access, collect all the words in their corresponding groups (like a cache)
	for (const word in riddle.words) {
		const groupId = riddle.words[word];
		if (typeof groupId === 'string' && groupId in riddle.groups) {
			riddle.groups[groupId].words!.push(word);
		}
	}

	const groupCount = Object.keys(riddle.groups).length;
	const wordCount = Object.keys(riddle.words).length;
	let right = 0;

	let game: Game = {
		state: GameState.guessing,
		words: Object.keys(riddle.words),
		guesses: [],
		coupled: [],
		mistakes: [],
		maxMistakes: riddle.mistakes ?? groupCount
	};

	const unit = 100 / (Math.ceil(wordCount / 2) + 4);

	// some shortcuts to determining the game state in the ui
	$: guessesEmpty = game.guesses.length <= 0;
	$: guessesFull = game.guesses.length >= riddle.wordsPerGroup; // false if the user still can choose a word, true if guesses are full
	$: percSolved = game.coupled.length / groupCount;
	$: mistakesRemaining = game.maxMistakes - game.mistakes.length;

	async function selectWord(event: CustomEvent) {
		game.state = GameState.guessing;
		if (guessesFull) {
			event.preventDefault();
		} else {
			game.guesses = [...game.guesses, event.detail];

			if (game.guesses.length >= riddle.wordsPerGroup) {
				if (game.mistakes.some((mistake) => game.guesses.sort().join() == mistake.sort().join())) {
					game.state = GameState.mistake;
				}
			}
		}
	}

	function deselectWord(event: CustomEvent) {
		if (game.state != GameState.lastGuess)
			game.guesses = game.guesses.filter((guess) => guess !== event.detail);
		game.state = GameState.guessing;
	}

	function clearWords(event?: Event) {
		game.guesses = [];
		game.state = GameState.guessing;
	}

	function coupleGuesses(event: Event) {
		// for each group, count how many of the guessed words are in it
		let counts = Object.fromEntries(Object.keys(riddle.groups).map((key) => [key, 0]));
		game.guesses.forEach((word) => {
			counts[riddle.words[word]]++;
		});

		// if all the guesses belong to one group, this group is correctly solved
		right = Math.max(...Object.values(counts));
		if (right >= riddle.wordsPerGroup) {
			const group = riddle.words[game.guesses[0]];

			if (!game.coupled.includes(group)) {
				game.coupled = [group, ...game.coupled];

				clearWords();

				if (game.coupled.length == groupCount) {
					// if all groups are solved, the game is won
					game.state = GameState.won;
				} else if (groupCount - game.coupled.length == 1) {
					// if only one group remains, preselect it for the user
					game.state = GameState.lastGuess;
					game.words.forEach((word) => {
						if (!game.coupled.includes(riddle.words[word])) game.guesses.push(word);
					});
				}
			}
		} else {
			game.state = GameState.mistake;
			game.mistakes = [...game.mistakes, game.guesses];

			// if the number of mistakes exceeds the maximum, the game is lost
			if (game.mistakes.length >= game.maxMistakes) game.state = GameState.lost;
		}
	}
</script>

<section class="h-full overflow-hidden">
	<!-- #region WORDS -->
	{#if game.state == GameState.lastGuess}
		<section
			class="grid px-4 text-3xl font-light text-center h-1/4 place-content-center font-condensed text-info"
			style="height: {unit * 3}%"
		>
			Kannst du auch die Gemeinsamkeit der letzten 4 Begriffe erraten?
		</section>
	{:else if game.state != GameState.lost}
		<ul
			class="grid grid-cols-2 group h-2/3 "
			style="height: {Math.ceil(wordCount / 2) * unit * (1 - percSolved)}%"
		>
			{#each game.words as word}
				{#if !game.coupled.includes(riddle.words[word])}
					<Word
						{word}
						state={game.guesses.includes(word) ? WordState.selected : WordState.normal}
						place={WordPlace.list}
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
	{#if game.state == GameState.won}
		<section
			class="grid px-4 text-3xl font-light text-center h-1/3 place-content-center font-condensed text-success"
			style="height: {unit * 4}%"
		>
			Herzlichen Glückwunsch, du hast gewonnen!
		</section>
	{:else if game.state == GameState.lost}
		<section
			class="grid px-4 text-3xl font-light text-center h-1/3 place-content-center font-condensed text-error"
			style="height: {unit * 4}%"
		>
			Schade, heute nicht geschafft.
		</section>
	{:else}
		{#if game.state !== GameState.lastGuess}
		<section
			class="grid justify-between grid-cols-2 text-xl font-light text-center align-middle place-content-center bg-dark text-light font-condensed"
			class:bg-red={mistakesRemaining == 1}
			style="height: {unit * 1}%"
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
			style="height: {unit * 3}%"
		>
			{#if game.state !== GameState.lastGuess}
				<GuessButton
					disabled={guessesEmpty}
					btnClass="btn-warning"
					icon="material-symbols-light:close"
					on:click={clearWords}>Leeren</GuessButton
				>
			{/if}
			{#if game.state == GameState.mistake}
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
				<GuessButton
					disabled={!guessesFull}
					btnClass="btn-info{game.state === GameState.lastGuess ? ' col-span-full' : ''}"
					icon="system-uicons:chain"
					iconRight
					on:click={coupleGuesses}>Kuppeln</GuessButton
				>
			{/if}
			<ul
				class="grid grid-cols-2 grid-rows-2 text-2xl font-light tracking-tighter col-span-full font-condensed"
			>
				{#each game.guesses as guess}
					<Word
						word={guess}
						place={WordPlace.guesses}
						state={game.state == GameState.lastGuess ? WordState.lastGuess : WordState.guessed}
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

	<!-- #region COUPLED -->
	{#if game.state == GameState.lost}
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

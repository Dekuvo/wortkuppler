<script lang="ts">
	import Word from './Word.svelte';
	import Icon from '@iconify/svelte';
	import GuessButton from './GuessButton.svelte';

	// TODO: import riddle dynamically
	import { riddle } from '../today';
	import { WordPlace, WordState } from '$lib/models/Word';
	import type Game from '$lib/models/Game';

	// for easier access, collect all the words in their corresponding groups (like a cache)
	for (const word in riddle.words) {
		const groupId = riddle.words[word];
		if (typeof groupId === 'string' && groupId in riddle.groups) {
			const group = riddle.groups[groupId];
			if (!group.words) group.words = [];
			group.words.push(word);
		}
	}
	
	let game:Game = {
		words: Object.keys(riddle.words),
		guesses: [],
		solved: [],
	}
	
	// some shortcuts to determining the game state in the ui
	$: guessesEmpty = game.guesses.length <= 0;
	$: guessesFull = game.guesses.length >= riddle.wordsPerGroup; // false if the user still can choose a word, true if guesses are full



	
	
	function wordSelect(event:CustomEvent) {
		if( guessesFull ) {
			event.preventDefault();
		} else {
			game.guesses = [...game.guesses, event.detail];
		}
	}

	function wordDeselect(event:CustomEvent) {
		game.guesses = game.guesses.filter(guess => guess !== event.detail);

	}

	function wordsClear(event:CustomEvent) {
		game.guesses = [];

	}
</script>

<ul
	class="group h-2/3 grid grid grid-cols-2 grid-rows-{Object.keys(riddle.words).length /
		2} text-2xl font-light tracking-tighter font-condensed"
	
>
	{#each game.words as word}
	<!-- {#if !game.guesses.includes(word)} -->
		
	<Word word={word} state={ game.guesses.includes(word) ? WordState.selected : WordState.normal} place={WordPlace.list} guessable={!guessesFull} on:select={wordSelect} on:deselect={wordDeselect} />
	<!-- {/if} -->
	{/each}
</ul>

<section class="mt-[calc(100%/24)] h-1/4 bg-light grid grid-cols-2 grid-rows-[1fr,2fr] font-light" >
	<GuessButton disabled={guessesEmpty} btnClass="btn-warning" icon="material-symbols-light:close" on:click={wordsClear}>Leeren</GuessButton>
	<GuessButton disabled={!guessesFull} btnClass="btn-info" icon="system-uicons:chain" iconRight>Kuppeln</GuessButton>
	<ul
		class="grid grid-cols-2 grid-rows-2 text-2xl font-light tracking-tighter col-span-full font-condensed"
		
	>
	{#each game.guesses as guess}
		<Word word={guess} place={WordPlace.guesses} state={WordState.guessed} on:deselect={wordDeselect} />
	{/each	}
	{#if guessesEmpty}
		<li class="px-12 text-center transition-all place-content-center col-span-full row-span-full">
			Wähle vier Begriffe, die etwas gemeinsam haben, und drücke dann auf KUPPELN.
		</li>
	{/if}
	</ul>
</section>

{#each Object.keys(riddle.groups) as group}
	<section class="hidden pt-2 font-light h-1/6">
		<h2
			class="flex items-center justify-between font-normal text-center uppercase bg-green-500 h-1/3 text-light font-condensed"
		>
			<span
				class="text-2xl flex-1 {riddle.groups[group].infos
					? 'ml-10'
					: ''} grid place-content-center">{riddle.groups[group].title}</span
			>
			{#if riddle.groups[group].infos}
				<Icon
					icon="material-symbols-light:live-help-outline-sharp"
					class="flex-initial mx-2 text-3xl align-middle transition-all cursor-pointer hover:scale-110"
				/>
			{/if}
		</h2>
		<ul
			class="grid grid-cols-2 grid-rows-2 text-xl font-light tracking-tighter h-2/3 bg-green font-condensed"
		>
			{#each riddle.groups[group].words ?? [] as word}
				<li class="grid px-2 text-center uppercase place-content-center">
					{word}
				</li>
			{/each}
		</ul>
	</section>
{/each}

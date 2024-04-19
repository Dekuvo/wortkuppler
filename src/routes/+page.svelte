<script lang="ts">
	import Word from './Word.svelte';
	import Icon from '@iconify/svelte';
	import GuessButton from './GuessButton.svelte';

	// TODO: import riddle dynamically
	import { riddle } from '../today';
	import { WordPlace, WordState } from '$lib/models/Word';
	import type Game from '$lib/models/Game';
	import { GameState } from '$lib/models/Game';

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
	
	let game:Game = {
		state: GameState.guessing,
		words: Object.keys(riddle.words),
		guesses: [],
		coupled: [],
		mistakes: [],
		maxMistakes: riddle.mistakes ?? Object.keys(riddle.groups).length,
	}
	
	// some shortcuts to determining the game state in the ui
	$: guessesEmpty = game.guesses.length <= 0;
	$: guessesFull = game.guesses.length >= riddle.wordsPerGroup; // false if the user still can choose a word, true if guesses are full
	$: percSolved = game.coupled.length / Object.keys(riddle.groups).length;


	console.log(riddle.groups);
	
	
	function selectWord(event:CustomEvent) {
		if( guessesFull ) {
			event.preventDefault();
		} else {
			game.guesses = [...game.guesses, event.detail];
		}
	}

	function deselectWord(event:CustomEvent) {
		game.guesses = game.guesses.filter(guess => guess !== event.detail);

	}

	function clearWords(event?:Event) {
		game.guesses = [];

	}

	function coupleGuesses(event:Event) {

		// for each group, count how many of the guessed words are in it
		let counts = Object.fromEntries(Object.keys(riddle.groups).map(key => [key, 0]));
		game.guesses.forEach( word => {
			counts[riddle.words[word]]++;
		})
		
		// if all the guesses belong to one group, this group is solved
		if( Math.max(...Object.values(counts)) >= riddle.wordsPerGroup )
		{
			const group = riddle.words[game.guesses[0]];
			
			if( !game.coupled.includes(group) ) {
				game.coupled = [group, ...game.coupled];

				clearWords();
				
				// if all groups are solved, the game is won
				if( game.coupled.length == Object.keys(riddle.groups).length )
					game.state = GameState.won;
			}
		} else {
			game.state = GameState.mistake;
			game.mistakes = [...game.mistakes,game.guesses];
			
			// if the number of mistakes exceeds the maximum, the game is lost
			if( game.mistakes.length >= game.maxMistakes )
				game.state = GameState.lost;
		}
		
	}
</script>

<ul
	class="grid grid-cols-2 text-2xl font-light tracking-tighter group h-2/3 font-condensed"
	style="height: {.666*(1-percSolved)*100}%"
>
	{#each game.words as word}
	{#if !game.coupled.includes(riddle.words[word])}
	<Word word={word} state={ game.guesses.includes(word) ? WordState.selected : WordState.normal} place={WordPlace.list} guessable={!guessesFull} on:select={selectWord} on:deselect={deselectWord} />
	{/if}
	{/each}
</ul>

<section class="mt-[calc(100%/24)] h-1/4 bg-light grid grid-cols-2 grid-rows-[1fr,2fr] font-light" >
	<GuessButton disabled={guessesEmpty} btnClass="btn-warning" icon="material-symbols-light:close" on:click={clearWords}>Leeren</GuessButton>
	<GuessButton disabled={!guessesFull} btnClass="btn-info" icon="system-uicons:chain" iconRight on:click={coupleGuesses}>Kuppeln</GuessButton>
	<ul
		class="grid grid-cols-2 grid-rows-2 text-2xl font-light tracking-tighter col-span-full font-condensed"
		
	>
	{#each game.guesses as guess}
		<Word word={guess} place={WordPlace.guesses} state={WordState.guessed} on:deselect={deselectWord} />
	{/each	}
	{#if guessesEmpty}
		<li class="px-12 text-center transition-all place-content-center col-span-full row-span-full">
			Wähle vier Begriffe, die etwas gemeinsam haben, und drücke dann auf KUPPELN.
		</li>
	{/if}
	</ul>
</section>

{#each game.coupled as group}
	<section class="pt-2 font-light h-1/6">
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

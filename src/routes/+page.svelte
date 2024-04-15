<script lang="ts">
	import Word from './Word.svelte';
	import Icon from '@iconify/svelte';
	import GuessButton from './GuessButton.svelte';

	// TODO: import riddle dynamically
	import { riddle } from '../today';
	import { WordState } from '$lib/models/Word';

	let guesses:string[] = [];
	$: guessable = guesses.length < riddle.wordsPerGroup;


	
	// for easier access, collect all the words in their corresponding groups
	for (const word in riddle.words) {
		const groupId = riddle.words[word];
		if (typeof groupId === 'string' && groupId in riddle.groups) {
			const group = riddle.groups[groupId];
			if (!group.words) group.words = [];
			group.words.push(word);
		}
	}
	
	function wordSelect(event:CustomEvent) {
		console.log( guessable );
		if( guessable ) {
			
			guesses = [...guesses, event.detail];
		
		} else {
			event.preventDefault();
		}
	}

	function wordDeselect(event:CustomEvent) {
		
		
		console.log(event);
	}
</script>

<ul
	class="h-2/3 grid grid-cols-2 grid-rows-{Object.keys(riddle.words).length /
		2} text-2xl font-light tracking-tighter font-condensed"
>
	{#each Object.keys(riddle.words) as word}
		<Word word={word} on:select={wordSelect} />
	{/each}
</ul>

<section class="mt-[calc(100%/24)] h-1/4 bg-light grid grid-cols-2 grid-rows-[1fr,2fr] font-light" >
	<GuessButton btnClass="btn-warning" icon="material-symbols-light:close">Leeren</GuessButton>
	<GuessButton btnClass="btn-info" icon="system-uicons:chain" iconRight>Kuppeln</GuessButton>
	<ul
		class="grid grid-cols-2 grid-rows-2 text-2xl font-light tracking-tighter col-span-full font-condensed"
		
	>
		<li class="grid hidden px-12 text-center only:block place-content-center col-span-full row-span-full">
			Wähle vier Begriffe, die etwas gemeinsam haben, und drücke dann auf KUPPELN.
		</li>
		{#each guesses as guess}
			<Word word={guess} state={WordState.guessed} on:select={wordDeselect} />
		{/each	}
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

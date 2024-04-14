<script lang="ts">
	import Icon from '@iconify/svelte';
	import GuessButton from './GuessButton.svelte';
	import type { Riddle, RiddleWords } from '$lib/models/Riddle';
	import type { W } from 'vitest/dist/reporters-LqC_WI4d.js';

	const riddle: Riddle = {
		id: crypto.randomUUID(),
		groups: [
			{
				title: 'Olympisch 2024',
				infos: 'Werden bei den Olympischen Sommerspielen 2024 in Paris ausgetragen.',
				url: 'https://olympics.com/de/sportarten/summer-olympics#tabfaqGuid-ddf78406-4aea-4bba-a5ea-b3b49f49f5f5',
				words: { Fechten: 12, Boxen: 3, Golf: 1, Judo: 0 }
			},
			{
				title: 'Automodelle',
				infos:
					'VW Polo, Seat Ibiza, Ford Mustang und der Fiat Panda sind beliebte Modelle dieser Hersteller.',
				words: { Polo: 15, Ibiza: 2, Mustang: 3, Panda: 7 }
			},
			{
				title: 'Kanarische Inseln',
				infos: 'Dies sind 4 von insgesamt 7 Inseln die zu den Kanaren zählen.',
				url: 'https://de.wikipedia.org/wiki/Kanarische_Inseln#Geographie',
				words: { Fuerteventura: 12, 'La Gomera': 8, Teneriffa: 4, Lanzarote: 8 }
			},
			{
				title: 'Likörweine',
				infos: 'Bekannte Dessert- oder auch Süßweine',
				url: 'https://de.wikipedia.org/wiki/Lik%C3%B6rwein#Bekannte_Lik%C3%B6rweine',
				words: { Madeira: 3, Sherry: null, Marsala: 4, Port: 2 }
			}
		]
	};

    // accumulating all words of the riddle in a form, that allows ordering them
    type WordPosition = {
        word: string;
        position: number|null;
    }
    let words:WordPosition[] = [];
	riddle.groups[0].words;
	riddle.groups.forEach((group) => {
        for( const word in group.words )
            words.push({word:word,position:group.words[word]});
	});

    // order all words by order in the data, or randomly if not specified precisely
    words.sort((a:WordPosition, b:WordPosition) => {
        if( a.position === b.position ) return Math.random() - .5;
        if( a.position === null ) return 1;
        if( b.position === null ) return -1;
        return a.position - b.position;
    });
    
</script>

<ul
	class="h-1/2 grid grid-cols-2 grid-rows-{words.length /
		2} text-xl font-light tracking-tighter font-condensed"
>
	{#each words as word}
		<li
			class="bg-light hover:bg-select cursor-pointer px-2 uppercase text-center grid place-content-center"
		>
			{word.word}
		</li>
	{/each}
</ul>

<section class="my-[calc(100%/24)] h-1/4 bg-light grid grid-cols-2 auto-rows-auto font-light">
	<GuessButton btnClass="btn-warning" icon="material-symbols-light:close">Leeren</GuessButton>
	<GuessButton btnClass="btn-info" icon="system-uicons:chain" iconRight>Kuppeln</GuessButton>
	<ul class="grid grid-cols-2 grid-rows-2 text-xl font-light tracking-tighter font-condensed"></ul>
</section>

{#each riddle.groups as group}
	<section class="h-1/6font-light">
		<h2
			class="flex items-center justify-between h-1/3 bg-green-500 text-light text-center uppercase font-normal font-condensed"
		>
			<span class="text-2xl flex-1 {group.infos ? 'ml-10' : ''} grid place-content-center"
				>{group.title}</span
			>
			{#if group.infos}
				<Icon
					icon="material-symbols-light:live-help-outline-sharp"
					class="hover:scale-110 transition-all cursor-pointer mx-2 flex-1 text-3xl flex-initial align-middle"
				/>
			{/if}
		</h2>
		<ul
			class="h-1/2 bg-green grid grid-cols-2 grid-rows-2 text-xl font-light tracking-tighter font-condensed"
		>
			{#each Object.keys(group.words) as word}
				<li class="px-2 uppercase text-center grid place-content-center">
					{word}
				</li>
			{/each}
		</ul>
	</section>
{/each}

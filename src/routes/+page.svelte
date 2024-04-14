<script lang="ts">
	import Icon from '@iconify/svelte';
	import GuessButton from './GuessButton.svelte';
	import type { Riddle } from '$lib/models/Riddle';
	import type { S } from 'vitest/dist/reporters-LqC_WI4d.js';

	const riddle: Riddle = {
		id: crypto.randomUUID(),
		groups: [
			{
				title: 'Olympisch 2024',
				infos: 'Werden bei den Olympischen Sommerspielen 2024 in Paris ausgetragen.',
				url: 'https://olympics.com/de/sportarten/summer-olympics#tabfaqGuid-ddf78406-4aea-4bba-a5ea-b3b49f49f5f5',
				words: ['Fechten', 'Boxen', 'Golf', 'Judo']
			},
			{
				title: 'Automodelle',
				infos:
					'VW Polo, Seat Ibiza, Ford Mustang und der Fiat Panda sind beliebte Modelle dieser Hersteller.',
				words: ['Polo', 'Ibiza', 'Mustang', 'Panda']
			},
			{
				title: 'Kanarische Inseln',
				infos: 'Dies sind 4 von insgesamt 7 Inseln die zu den Kanaren zählen.',
				url: 'https://de.wikipedia.org/wiki/Kanarische_Inseln#Geographie',
				words: ['Fuerteventura', 'La Gomera', 'Teneriffa', 'Lanzarote']
			},
			{
				title: 'Likörweine',
				infos: 'Bekannte Dessert- oder auch Süßweine',
				url: 'https://de.wikipedia.org/wiki/Lik%C3%B6rwein#Bekannte_Lik%C3%B6rweine',
				words: ['Madeira', 'Sherry', 'Marsala', 'Port']
			}
		],
		order: [7, 4, 15, 7]
	};

	// create lookup dict for the default order of the words, by taking the values as keys and the index as values, ignoring duplicates
	const lookup =
		riddle.order?.reduce<{ [key: number]: number }>(
			(acc, val, idx) => (acc[val] === undefined ? { ...acc, [val]: idx } : acc),
			{}
		) ?? {};

	// order the words by given default order and add rest randomly to the end
	// let words = new Map<number, string>();
	// let i = 0;
	// riddle.groups.forEach(group => {
	//     group.words.forEach(word => {
	//         words.set( i in lookup ? lookup[i] : -Math.random() + ( riddle.order?.length ?? 0 )   , word )
	//         i++
	//     })
	// })

	let words = new Array<string>();
	let rest = new Array<string>();

	let i = 0;
	riddle.groups.forEach((group) => {
		group.words.forEach((word) => {
			if (i in lookup) {
				words[lookup[i]] = word;
			} else {
                rest.splice(Math.floor(Math.random() * (rest.length + 1)), 0, word);
			}
            i++
		});
	});



	words = words.concat(rest);

	// console.log( Array.from( words ).sort( (a: [number, string], b: [number, string]) => {
	//     return a[0] - b[0];
	// } ) );
</script>

<ul
	class="h-1/2 grid grid-cols-2 grid-rows-{words.length /
		2} text-xl font-light tracking-tighter font-condensed"
>
	{#each words as word}
		<li
			class="bg-light hover:bg-select cursor-pointer px-2 uppercase text-center grid place-content-center"
		>
			{word}
		</li>
	{/each}
</ul>

<section class="my-[calc(100%/24)] h-1/4 bg-light grid grid-cols-2 auto-rows-auto font-light">
	<GuessButton btnClass="btn-warning" icon="material-symbols-light:close">Leeren</GuessButton>
	<GuessButton btnClass="btn-info" icon="system-uicons:chain" iconRight>Kuppeln</GuessButton>
	<ul class="grid grid-cols-2 grid-rows-2 text-xl font-light tracking-tighter font-condensed"></ul>
</section>

{#each riddle.groups as group}
	<section class="h-1/6 bg-green font-light">
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
			class="h-2/3 grid grid-cols-2 grid-rows-2 text-xl font-light tracking-tighter font-condensed"
		>
			{#each group.words as word}
				<li class="px-2 uppercase text-center grid place-content-center">
					{word}
				</li>
			{/each}
		</ul>
	</section>
{/each}

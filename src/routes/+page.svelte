<script lang="ts">
	import Icon from '@iconify/svelte';
	import GuessButton from './GuessButton.svelte';
	import type { Riddle, RiddleWords } from '$lib/models/Riddle';

	let riddle: Riddle = {
		id: crypto.randomUUID(),
		groups: {
			olympisch: {
				title: 'Olympisch 2024',
				infos: 'Werden bei den Olympischen Sommerspielen 2024 in Paris ausgetragen.',
				url: 'https://olympics.com/de/sportarten/summer-olympics#tabfaqGuid-ddf78406-4aea-4bba-a5ea-b3b49f49f5f5'
			},
			automodell: {
				title: 'Automodelle',
				infos:
					'VW Polo, Seat Ibiza, Ford Mustang und der Fiat Panda sind beliebte Modelle dieser Hersteller.'
			},
			kanaren: {
				title: 'Kanarische Inseln',
				infos: 'Dies sind 4 von insgesamt 7 Inseln die zu den Kanaren zählen.',
				url: 'https://de.wikipedia.org/wiki/Kanarische_Inseln#Geographie'
			},
			likoerwein: {
				title: 'Likörweine',
				infos: 'Bekannte Dessert- oder auch Süßweine',
				url: 'https://de.wikipedia.org/wiki/Lik%C3%B6rwein#Bekannte_Lik%C3%B6rweine'
			}
		},
		words: {
			Fechten: 'olympisch',
			Sherry: 'likoerwein',
			Ibiza: 'automodell',
			Teneriffa: 'kanaren',
			Madeira: 'likoerwein',
			Fuerteventura: 'kanaren',
			Judo: 'olympisch',
			Mustang: 'automodell',
			Port: 'likoerwein',
			Lanzarote: 'kanaren',
			Polo: 'automodell',
			Golf: 'olympisch',
			'La Gomera': 'kanaren',
			Boxen: 'olympisch',
			Panda: 'automodell',
			Marsala: 'likoerwein',
		}
	};

	// for easier access collect all the words in their corresponding group
	for (const word in riddle.words) {
		const groupId = riddle.words[word];
		if (typeof groupId === 'string' && groupId in riddle.groups) {
			const group = riddle.groups[groupId];
			if (!group.words) group.words = [];
			group.words.push(word);
		}
	}
</script>


<ul
	class="h-2/3 grid grid-cols-2 grid-rows-{Object.keys(riddle.words).length /
		2} text-2xl font-light tracking-tighter font-condensed"
>
	{#each Object.keys(riddle.words) as word}
		<li
			class="bg-light hover:bg-select border-solid cursor-pointer px-2 uppercase text-center grid place-content-center"
		>
			{word}
		</li>
	{/each}
</ul>

<section class="mt-[calc(100%/24)] h-1/4 bg-light grid grid-cols-2 grid-rows-[1fr,2fr] font-light">
	<GuessButton btnClass="btn-warning" icon="material-symbols-light:close">Leeren</GuessButton>
	<GuessButton btnClass="btn-info" icon="system-uicons:chain" iconRight>Kuppeln</GuessButton>
	<ul class="col-span-full grid grid-cols-2 grid-rows-2 text-xl font-light tracking-tighter font-condensed">
		<li class=" grid place-content-center col-span-full row-span-full text-2xl px-12 text-center">Wähle vier Begriffe, die etwas gemeinsam haben, und drücke dann auf KUPPELN.</li>
	</ul>
</section>

{#each Object.keys(riddle.groups) as group}
	<section class="hidden pt-2 h-1/6 font-light">
		<h2
			class="flex items-center justify-between h-1/3 bg-green-500 text-light text-center uppercase font-normal font-condensed"
		>
			<span
				class="text-2xl flex-1 {riddle.groups[group].infos
					? 'ml-10'
					: ''} grid place-content-center">{riddle.groups[group].title}</span
			>
			{#if riddle.groups[group].infos}
				<Icon
					icon="material-symbols-light:live-help-outline-sharp"
					class="hover:scale-110 transition-all cursor-pointer mx-2 text-3xl flex-initial align-middle"
				/>
			{/if}
		</h2>
		<ul
			class="h-2/3 bg-green grid grid-cols-2 grid-rows-2 text-xl font-light tracking-tighter font-condensed"
		>
			{#each riddle.groups[group].words ?? [] as word}
				<li class="px-2 uppercase text-center grid place-content-center">
					{word}
				</li>
			{/each}
		</ul>
	</section>
{/each}

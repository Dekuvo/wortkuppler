<script lang="ts">
	import type { RiddleGroup } from '$lib/models/Riddle';
	import { WordState } from '$lib/models/Word';
	import { scale, slide } from 'svelte/transition';
	import Word from './Word.svelte';
	import Icon from '@iconify/svelte';

    export let group:RiddleGroup;
    export let height:number;
    export let coupled:boolean = true;
    let info = false;
</script>

<section class="relative font-light group" style="height: {height}%" class:info >
		<h2
			class="flex items-center justify-between font-normal text-center uppercase {coupled?'bg-green-500':'bg-red-500'} h-1/3 text-light font-condensed"
		>
			<span
				class="text-2xl flex-1 {group.infos
					? 'ml-10'
					: ''} grid place-content-center">{group.title}</span
			>
			{#if group.infos}
            <button class="flex-initial mx-2" on:click={event => {info = !info}}>
				<Icon
					icon="material-symbols-light:live-help-outline-sharp"
					class="group-[.info]:hidden text-3xl align-middle transition-all cursor-pointer hover:scale-110"
				/><Icon
					icon="material-symbols-light:live-help-sharp"
					class="group-[:not(.info)]:hidden text-3xl align-middle transition-all cursor-pointer hover:scale-110"
				/>
            </button>
			{/if}
		</h2>
		<ul
			class="grid grid-cols-2 grid-rows-2 text-2xl font-light tracking-tighter h-2/3 {coupled?'bg-green':'bg-red text-light'} font-condensed"
		>
			{#each group.words ?? [] as word}
				<Word {word} state={WordState.coupled} />
			{/each}
		</ul>
		{#if group.infos}
			<div
				class="absolute leading-none bottom-0 grid w-full p-4 text-xl text-center transition-all duration-500 h-2/3 {coupled?'bg-green':'bg-red text-light'} place-content-center opacity-0 group-[.info]:opacity-90 font-condensed"
			>
				{group.infos}
			</div>
		{/if}
	</section>


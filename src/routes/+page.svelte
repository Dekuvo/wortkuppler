<script lang="ts">
	import Icon from '@iconify/svelte';
  import GuessButton from './GuessButton.svelte';

const words = [
    'Madeira', 'Ibiza', 'Panda',
    'Port', 'Golf', 'Polo',
    'Sherry', 'Boxen', 'Mustang',
    'Marsala', 'Turnen', 'Judo',
];

const groups = [
    {
        title: 'Kanarische Inseln',
        infos: 'Dies sind 4 der insgesamt 7 Inseln die zu den Kanaren zählen.',
        words: ['Fuerteventura', 'La Gomera', 'Teneriffa', 'Lanzarote' ]
    }
];

</script>

<ul class="h-1/2 grid grid-cols-2 grid-rows-6 text-xl font-light tracking-tighter font-condensed">
    {#each words as word}
    <li class="bg-light hover:bg-select cursor-pointer px-2 uppercase text-center grid place-content-center">
        {word}
    </li>
    {/each}
</ul>

<section class="my-[calc(100%/24)] h-1/4 bg-light grid grid-cols-2 auto-rows-auto font-light">
    <GuessButton btnClass="btn-warning" icon="material-symbols-light:close">Leeren</GuessButton>
    <GuessButton btnClass="btn-info" icon="system-uicons:chain" iconRight>Kuppeln</GuessButton>
    <ul class="grid grid-cols-2 grid-rows-2 text-xl font-light tracking-tighter font-condensed">
        
    </ul>
</section>

{#each groups as group}
    
<section class="h-1/6 bg-green font-light">
    <h2 class="flex items-center justify-between h-1/3 bg-green-500 text-light text-center uppercase font-normal font-condensed">
        <span class="text-2xl flex-1 {group.infos?'ml-10':''} grid place-content-center">{group.title}</span>
        {#if group.infos}
        <Icon icon="material-symbols-light:live-help-outline-sharp" class="hover:scale-110 transition-all cursor-pointer mx-2 flex-1 text-3xl flex-initial align-middle" />
            
        {/if}
    </h2>
    <ul class="h-2/3 grid grid-cols-2 grid-rows-2 text-xl font-light tracking-tighter font-condensed">
        {#each group.words as word}
        <li class="px-2 uppercase text-center grid place-content-center">
            {word}
        </li>
        {/each}
    </ul>
</section>

{/each}
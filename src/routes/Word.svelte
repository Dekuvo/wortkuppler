<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { WordState } from '$lib/models/Word';

	const dispatch = createEventDispatcher();
	export let state: WordState = WordState.normal;
	export let word:string;

	function wordClick(event: Event) {
		switch (state) {
			case WordState.normal:
				if (dispatch('select', word, { cancelable: true })) state = WordState.selected;
				break;

			default:
				break;
		}
	}
</script>

<li
	class="grid px-2 text-center uppercase border-solid cursor-pointer bg-light hover:bg-select place-content-center"
	class:bg-select={[WordState.selected, WordState.guessed].includes(state)}
	on:click={wordClick}
>
	{word}
</li>

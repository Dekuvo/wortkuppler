<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { WordPlace, WordState } from '$lib/models/Word';
	import { scale } from 'svelte/transition';

	const dispatch = createEventDispatcher();
	export let guessable: boolean = true;
	export let state: WordState = WordState.normal;
	export let place: WordPlace = WordPlace.list;
	export let word: string;

	function getClassesForState(state: WordState, guessable: boolean) {
		let classes: string[] = [];
		switch (state) {
			case WordState.normal:
				if (guessable) classes.push('[@media(hover)]:hover:bg-select');
				if (!guessable) classes.push('cursor-not-allowed','text-select');
				break;

			case WordState.selected:
				// classes.push('bg-select');
				classes.push('opacity-50','[@media(hover)]:hover:bg-red','[@media(hover)]:hover:text-light');

				break;

			case WordState.guessed:
				classes.push('bg-select','[@media(hover)]:hover:bg-red','[@media(hover)]:hover:text-light');
				classes.push('bg-select');
				break;

			case WordState.coupled:
				break;
		}

		return classes.join(' ');
	}

	$: classes = getClassesForState(state, guessable);

	function wordClick(event: Event) {
		switch (state) {
			case WordState.normal:
				if (dispatch('select', word, { cancelable: true })) state = WordState.selected;
				
				break;

			case WordState.selected:
				if (dispatch('deselect', word, { cancelable: true }) ) state = WordState.normal;
			case WordState.guessed:
				dispatch('deselect', word, { cancelable: true });
				break;

			default:
				break;
		}
	}
</script>

<li
	class="grid px-2 text-center uppercase border-solid cursor-pointer bg-light place-content-center transition-all {classes}"
	on:click={wordClick}
	
>
	{word}
</li>

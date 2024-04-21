<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { WordState } from '$lib/models/Word';
	import { scale } from 'svelte/transition';

	const dispatch = createEventDispatcher();
	export let selectable: boolean = true;
	export let state: WordState = WordState.normal;
	export let word: string;

	function getClassesForState(state: WordState, selectable: boolean) {
		let classes: string[] = [];
		switch (state) {
			case WordState.normal:
				classes.push('bg-light');
				if (selectable) {
					classes.push('cursor-pointer', '[@media(hover)]:hover:bg-select');
				} else {
					classes.push('cursor-not-allowed', 'text-select');
				}
				break;

			case WordState.selected:
				classes.push(
					'bg-light',
					'opacity-50',
					'cursor-pointer',
					'[@media(hover)]:hover:bg-red',
					'[@media(hover)]:hover:text-light'
				);

				break;

			case WordState.selection:
				classes.push(
					'bg-select',
					'cursor-pointer',
					'[@media(hover)]:hover:bg-red',
					'[@media(hover)]:hover:text-light'
				);
				break;

			case WordState.lastGroup:
				classes.push('bg-select', 'cursor-not-allowed');
				break;

			case WordState.coupled:
				break;
		}

		return classes.join(' ');
	}

	$: classes = getClassesForState(state, selectable);

	function wordClick(event: Event) {
		switch (state) {
			case WordState.normal:
				if (dispatch('select', word, { cancelable: true })) state = WordState.selected;

				break;

			case WordState.selected:
				if (dispatch('deselect', word, { cancelable: true })) state = WordState.normal;
			case WordState.selection:
				dispatch('deselect', word, { cancelable: true });
				break;

			default:
				break;
		}
	}
</script>

<li class="transition-all ">
	<button
		class="{classes} grid w-full h-full px-2 text-2xl font-light tracking-tighter text-center uppercase place-content-center font-condensed"
		on:click={wordClick}>{word}</button
	>
</li>

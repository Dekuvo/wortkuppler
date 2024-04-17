<script lang="ts">
	import Icon from '@iconify/svelte';
    import type { IconifyIcon } from '@iconify/svelte';

    export let disabled:boolean = false;
    export let icon:string|IconifyIcon|null = null;
    export let iconRight:boolean = false;
    export let btnClass:string = 'btn-info';
</script>

<button {disabled} on:click class="flex justify-between btn {btnClass} {iconRight?'flex-row-reverse ':''} h-full px-2 uppercase text-2xl font-light tracking-tighter font-condensed transition-all">
    {#if icon}
        <Icon icon="{icon}" class="flex-initial text-3xl" />
    {/if}
    <span class="flex-1 {icon?((iconRight?'ml-10':'mr-10')):''}"><slot /></span>
</button>


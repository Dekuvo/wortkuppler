<script lang="ts">
	import Icon from '@iconify/svelte';
    import type { IconifyIcon } from '@iconify/svelte';

    export let icon:string|IconifyIcon|null = null;
    export let iconRight:boolean = false;
    export let btnClass:string = 'btn-info';
</script>

<button class="flex justify-between btn {btnClass} {iconRight?'flex-row-reverse ':''} h-1/4 px-2 uppercase text-xl font-light tracking-tighter font-condensed">
    {#if icon}
        <Icon icon="{icon}" class="text-3xl flex-initial" />
    {/if}
    <span class="flex-1 {icon?((iconRight?'ml-10':'mr-10')):''}"><slot /></span>
</button>


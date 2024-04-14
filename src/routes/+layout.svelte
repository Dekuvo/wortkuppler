<script lang="ts">
	import Icon from '@iconify/svelte';
	import '@fontsource/poppins';
	import '../app.css';
	// import type { LayoutData } from './$types';

	// export let data: LayoutData;
</script>

<div class="flex flex-col h-screen">
	<header class="flex-initial px-4 py-3 flex justify-between">
		<h1 class="flex-col font-thin text-4xl uppercase tracking-wide">Wortkuppler</h1>
		<nav class="drawer drawer-end w-auto shrink-0">
            <input id="menu" type="checkbox" class="drawer-toggle" />
			<label for="menu" role="button" tabindex="0" class="drawer-button btn bg-dark hover:bg-brown-600 w-10 h-10 min-h-9 px-1 mx-2">
				<Icon icon="material-symbols-light:menu" class="text-light text-4xl" />
			</label>
            <div class="drawer-side overflow-x-hidden">
                <label for="menu" aria-label="close sidebar" class="drawer-overlay"></label>
                <ul tabindex="0" class="menu p-4 w-80 min-h-full bg-light text-base-content rounded-none [&_li>*]:rounded-none">
                    <li class="hover:bg-select"><a>Heutiges Rätsel</a></li>
                    <li class="hover:bg-select"><a>Archiv</a></li>
                    <li class="hover:bg-select"><label for="menu" aria-label="close sidebar" class="drawer-overlay">Schließen</label></li>
                </ul>
            </div>
		</nav>
	</header>

    <main class="flex-1">
        <slot />
    </main>

    <footer class="flex-initial">
        © workuppler
    </footer>
</div>

<script lang="ts">
	import Icon from '@iconify/svelte';
	import '@fontsource/poppins';
	import '../app.css';
	// import type { LayoutData } from './$types';

	// export let data: LayoutData;
</script>

<div class="flex flex-col screen h-dvh">
	<header class="flex justify-between flex-initial px-4 py-3">
		<h1 class="flex-col text-4xl font-thin tracking-wide uppercase">Wortkuppler</h1>
		<nav class="w-auto drawer drawer-end shrink-0">
            <input id="menu" type="checkbox" class="drawer-toggle" />
			<label for="menu" class="w-10 h-10 px-1 mx-2 drawer-button btn bg-dark hover:bg-brown-600 min-h-9">
				<Icon icon="material-symbols-light:menu" class="text-4xl text-light" />
			</label>
            <div class="overflow-x-hidden drawer-side">
                <label for="menu" aria-label="close sidebar" class="drawer-overlay"></label>
                <ul class="font-condensed font-light menu p-4 w-80 min-h-full bg-light text-2xl text-base-content rounded-none [&_li>*]:rounded-none">
                    <li class="hover:bg-select"><a href="/">Heutiges Rätsel</a></li>
                    <li class="hover:bg-select"><a href="/">Archiv</a></li>
                    <li class="hover:bg-select"><label for="menu" aria-label="close sidebar" class="drawer-overlay">Schließen</label></li>
                </ul>
            </div>
		</nav>
	</header>

    <main class="flex-1">
        <slot />
    </main>

    <footer class="flex-initial text-center text-select">
        © workuppler
    </footer>
</div>

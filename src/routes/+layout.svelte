<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { ModeWatcher, mode } from 'mode-watcher';

	const { children } = $props();
</script>


<ModeWatcher />
<div class="min-h-screen bg-white dark:bg-black transition-colors duration-200">
	<Navbar />
	<main >
		{@render children()}
	</main>
</div>

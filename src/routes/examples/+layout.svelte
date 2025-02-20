<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="app">
	<Header />
	<div class="flow">
		{@render children?.()}
	</div>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.flow {
		flex: 1;
	}
</style>

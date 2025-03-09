<script lang="ts">
	import { goto } from "$app/navigation";
  import FlowPreview from '$lib/components/FlowPreview.svelte';

  const { data }: { data: { flows: { flow_id: string, meta: string }[] } } = $props();
  interface FlowMeta {
    nodes_count: number;
    edges_count: number;
  }

  // const data = {flows:[
  //   {
  //     flow_id: '123412',
  //     meta: JSON.stringify({ nodes_count: 5, edges_count: 4})
  //   },
  //   {
  //     flow_id: '123',
  //     meta: JSON.stringify({ nodes_count: 10, edges_count: 10 })
  //   },
  //   {
  //     flow_id: '456',
  //     meta: JSON.stringify({ nodes_count: 20, edges_count: 20 })
  //   },
  //   {
  //     flow_id: '789',
  //     meta: JSON.stringify({ nodes_count: 6, edges_count: 5})
  //   },
  // ]}
  
  function newFlow() {
    // Generate a 6-character random string for flow_id
    const flow_id = Math.random().toString(36).substring(2, 8);
    goto(`/collaborative-flow/${flow_id}`);
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Your Flows</h1>
    <button 
      onclick={newFlow}
      class="bg-orange-400 hover:bg-orange-500 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200 flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      New Flow
    </button>
  </div>

  {#if data.flows.length === 0}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-orange-300 dark:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      <h2 class="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">No flows found</h2>
      <p class="mt-2 text-gray-500 dark:text-gray-400">Create your first flow to get started</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {#each data.flows as flow}
        {@const metadata = JSON.parse(flow.meta) as FlowMeta}
        <a 
          href={`/collaborative-flow/${flow.flow_id}`}
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col border border-gray-200 dark:border-gray-700"
        >
          <div class="h-40 bg-gray-100 dark:bg-gray-700 p-4">
            <FlowPreview nodesCount={metadata.nodes_count} edgesCount={metadata.edges_count} />
          </div>
          <div class="p-4">
            <h3 class="font-medium text-gray-800 dark:text-white text-lg">{flow.flow_id}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {metadata.nodes_count} nodes • {metadata.edges_count} edges
            </p>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<script lang="ts">
	import { goto } from "$app/navigation";

  const { data }: { data: { flows: { flow_id: string, meta: string }[] } } = $props();
  interface FlowMeta {
    nodes_count: number;
    edges_count: number;
  }
  function newFlow() {
    // generate a small random number of 5 characters
    const flow_id = Math.random().toString(36).substring(2, 7);
    goto(`/collaborative-flow/${flow_id}`);
  }
</script>


<div>
  <h1>Collaborative Flow</h1>
  <ul>
    {#if data.flows.length === 0}
      <h2>No flows found</h2>
    {:else}
      {#each data.flows as flow}
        {@const metadata = JSON.parse(flow.meta) as FlowMeta}
        <li>
        <a href={`/collaborative-flow/${flow.flow_id}`}>{flow.flow_id}</a>
        <p>{metadata.nodes_count} nodes, {metadata.edges_count} edges</p>
      </li>
    {/each}
    {/if}
  </ul>
  <button onclick={newFlow}>New Flow</button>
</div>

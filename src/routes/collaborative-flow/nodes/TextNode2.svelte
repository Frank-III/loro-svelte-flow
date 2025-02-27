<script lang="ts">
  import { Handle, Position, useSvelteFlow, type NodeProps, type Node } from '@xyflow/svelte';
  import { FlowDoc, getFlowDoc, updateNodeDataAndSync } from '../LoroDoc.svelte';
	import { onMount } from 'svelte';

  type TextNodeType = Node<{
    text: string;
  }, 'text'>;

  let { id, data, positionAbsoluteX, positionAbsoluteY }: NodeProps<TextNodeType> = $props();
  const { updateNodeData } = $derived(useSvelteFlow());
  let flowDoc = getFlowDoc();
  function handleTextChange(e: Event) {
    const input = e.target as HTMLInputElement;
    updateNodeDataAndSync(
      flowDoc,
      id, 
      { text: input.value },
      updateNodeData,
      'text',
      { x: positionAbsoluteX, y: positionAbsoluteY }
    );
  }
</script>

<div class="text-node">
  <Handle type="target" position={Position.Left} />
  
  <input
    type="text"
    value={data.text}
    oninput={handleTextChange}
    placeholder="Enter text..."
    class="nodrag"
  />
  
  <Handle type="source" position={Position.Right} />
</div>

<style>
  .text-node {
    padding: 10px;
    border-radius: 5px;
    background: white;
    border: 1px solid #ddd;
    min-width: 150px;
  }

  .title {
    font-size: 12px;
    color: #777;
    margin-bottom: 5px;
  }

  input {
    width: 100%;
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
  }

  input:focus {
    outline: none;
    border-color: #aaa;
  }
</style>

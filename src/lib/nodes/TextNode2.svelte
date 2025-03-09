<script lang="ts">
  import { Handle, Position, useSvelteFlow, type NodeProps, type Node } from '@xyflow/svelte';
  import { FlowDoc, getFlowDoc, updateNodeDataAndSync } from './LoroDoc.svelte';
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

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 border border-gray-200 dark:border-gray-700 min-w-[180px] transition-colors duration-200">
  <Handle 
    type="target" 
    position={Position.Left} 
    class="w-2 h-2 bg-orange-400 dark:bg-orange-500 border-2 border-white dark:border-gray-800"
  />
  
  <input
    type="text"
    value={data.text}
    oninput={handleTextChange}
    placeholder="Enter text..."
    class="nodrag w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-sm"
  />
  
  <Handle 
    type="source" 
    position={Position.Right} 
    class="w-2 h-2 bg-orange-400 dark:bg-orange-500 border-2 border-white dark:border-gray-800"
  />
</div>

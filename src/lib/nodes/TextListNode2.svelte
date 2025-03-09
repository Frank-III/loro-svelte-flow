<script lang="ts">
  import { Handle, Position, useSvelteFlow, type NodeProps, type Node } from '@xyflow/svelte';
  import type { TextItem } from './node-types.svelte';
  import { getFlowDoc, updateNodeDataAndSync } from './LoroDoc.svelte';

  type TextListNodeType = Node<{
    label: string;
    items: TextItem[];
  }, 'textList'>;

  let { id, data, positionAbsoluteX, positionAbsoluteY }: NodeProps<TextListNodeType> = $props();
  const { updateNodeData } = useSvelteFlow();
  const flowDoc = getFlowDoc();
  function addItem() {
    const newItems = [...data.items, { id: crypto.randomUUID(), text: '' }];
    updateNodeDataAndSync(
      flowDoc,
      id,
      { items: newItems },
      updateNodeData,
      'textList',
      { x: positionAbsoluteX, y: positionAbsoluteY }
    );
  }

  function removeItem(itemId: string) {
    const newItems = data.items.filter(item => item.id !== itemId);
    updateNodeDataAndSync(
      flowDoc,
      id,
      { items: newItems },
      updateNodeData,
      'textList',
      { x: positionAbsoluteX, y: positionAbsoluteY }
    );
  }

  function updateItemText(itemId: string, newText: string) {
    const newItems = data.items.map(item => 
      item.id === itemId ? { ...item, text: newText } : item
    );
    updateNodeDataAndSync(
      flowDoc,
      id,
      { items: newItems },
      updateNodeData,
      'textList',
    );
  }

  function updateLabel(e: Event) {
    const input = e.target as HTMLInputElement;
    updateNodeDataAndSync(
      flowDoc,
      id,
      { label: input.value },
      updateNodeData,
      'textList',
    );
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700 min-w-[220px] transition-colors duration-200">
  <Handle 
    type="target" 
    position={Position.Left} 
    class="w-2 h-2 bg-orange-400 dark:bg-orange-500 border-2 border-white dark:border-gray-800"
  />
  
  <div class="flex items-center justify-between mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
    <input 
      type="text" 
      value={data.label} 
      oninput={updateLabel} 
      placeholder="List title..."
      class="nodrag flex-1 bg-transparent text-gray-800 dark:text-gray-200 font-medium focus:outline-none text-sm"
    />
    <button 
      class="nodrag flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-500 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors duration-200"
      onclick={addItem}
      aria-label="Add item"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
  
  <div class="space-y-1">
    {#each data.items as item (item.id)}
      <div class="flex items-center relative group">
        <input
          type="text"
          value={item.text}
          oninput={(e) => updateItemText(item.id, e.currentTarget.value)}
          placeholder="Enter text..."
          class="nodrag w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-sm"
        />
        
        <button 
          class="nodrag absolute right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-opacity duration-200"
          onclick={() => removeItem(item.id)}
          style:visibility={data.items.length > 1 ? 'visible' : 'hidden'}
          aria-label="Remove item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <Handle
          type="source"
          position={Position.Right}
          id={item.id}
          class="w-2 h-2 bg-orange-400 dark:bg-orange-500 border-2 border-white dark:border-gray-800"
        />
      </div>
    {/each}
  </div>
</div>

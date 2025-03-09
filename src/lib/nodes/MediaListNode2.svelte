<script lang="ts">
  import { Handle, Position, useSvelteFlow, type NodeProps, type Node } from '@xyflow/svelte';
  import type { MediaItem } from './node-types.svelte';
  import { updateNodeDataAndSync } from './LoroDoc.svelte';
	import { getFlowDoc } from './LoroDoc.svelte';

  type MediaListNodeType = Node<{
    label: string;
    items: MediaItem[];
  }, 'mediaList'>;

  let { id, data, positionAbsoluteX, positionAbsoluteY }: NodeProps<MediaListNodeType> = $props();
  const { updateNodeData } = useSvelteFlow();
  const flowDoc = getFlowDoc();
  function addItem() {
    const newItems = [...data.items, { id: crypto.randomUUID(), text: '', imageUrl: '' }];
    updateNodeDataAndSync(
      flowDoc,
      id,
      { items: newItems },
      updateNodeData,
      'mediaList',
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
      'mediaList',
      { x: positionAbsoluteX, y: positionAbsoluteY }
    );
  }

  function updateItem(itemId: string, updates: Partial<MediaItem>) {
    const newItems = data.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateNodeDataAndSync(
      flowDoc,
      id,
      { items: newItems },
      updateNodeData,
      'mediaList',
      { x: positionAbsoluteX, y: positionAbsoluteY }
    );
  }

  function updateLabel(e: Event) {
    const input = e.target as HTMLInputElement;
    updateNodeDataAndSync(
      flowDoc,
      id,
      { label: input.value },
      updateNodeData,
      'mediaList',
      { x: positionAbsoluteX, y: positionAbsoluteY }
    );
  }

  async function handleImageUpload(event: Event, itemId: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Convert the file to a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateItem(itemId, { imageUrl });
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700 min-w-[250px] transition-colors duration-200">
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
      placeholder="Media list title..."
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
  
  <div class="space-y-3">
    {#each data.items as item (item.id)}
      <div class="relative group">
        <div class="flex gap-2 items-center">
          <div class="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
            {#if item.imageUrl}
              <img
                src={item.imageUrl}
                alt="Item"
                class="w-full h-full object-cover"
              />
            {:else}
              <label 
                for="image-{item.id}" 
                class="nodrag w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-xs">Upload</span>
              </label>
            {/if}
            <input
              type="file"
              id="image-{item.id}"
              accept="image/*"
              class="nodrag hidden"
              onchange={(e) => handleImageUpload(e, item.id)}
            />
          </div>
          
          <div class="flex-1">
            <input
              type="text"
              value={item.text}
              oninput={(e) => updateItem(item.id, { text: e.currentTarget.value })}
              placeholder="Enter description..."
              class="nodrag w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-sm"
            />
          </div>
        </div>
        
        <button 
          class="nodrag absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onclick={() => removeItem(item.id)}
          style:visibility={data.items.length > 1 ? 'visible' : 'hidden'}
          aria-label="Remove item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
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

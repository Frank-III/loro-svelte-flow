<script lang="ts">
  import { Handle, Position, useSvelteFlow, type NodeProps, type Node } from '@xyflow/svelte';
  import { getFlowDoc, updateNodeDataAndSync } from './LoroDoc.svelte';

  type ListPickerNodeType = Node<{
    label: string;
    options: string[];
    selected: number;
    selectedOption: string | undefined;
  }, 'picker'>;

  let { id, data, positionAbsoluteX, positionAbsoluteY }: NodeProps<ListPickerNodeType> = $props();
  const { updateNodeData } = useSvelteFlow();

  let isOpen = $state(false);
  const flowDoc = getFlowDoc();
  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectOption(index: number) {
    updateNodeDataAndSync(
      flowDoc,
      id,
      { selected: index, selectedOption: data.options[index] },
      updateNodeData,
      'picker',
      { x: positionAbsoluteX, y: positionAbsoluteY }
    );
    isOpen = false;
  }

  function addOption() {
    const newOption = `Option ${data.options.length + 1}`;
    updateNodeDataAndSync(
      flowDoc,
      id,
      { options: [...data.options, newOption] },
      updateNodeData,
      'picker',
      { x: positionAbsoluteX, y: positionAbsoluteY }
    );
  }

  function removeOption(optionToRemove: string) {
    const newOptions = data.options.filter(opt => opt !== optionToRemove);
    const updates: any = { options: newOptions };
    
    if (data.selectedOption === optionToRemove) {
      updates.selected = 0;
    }
    
    updateNodeDataAndSync(
      flowDoc,
      id,
      updates,
      updateNodeData,
      'picker',
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
      'picker',
      { x: positionAbsoluteX, y: positionAbsoluteY }
    );
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700 min-w-[180px] transition-colors duration-200" class:active={isOpen}>
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
      placeholder="Picker title..."
      class="nodrag flex-1 bg-transparent text-gray-800 dark:text-gray-200 font-medium focus:outline-none text-sm"
    />
    <button 
      class="nodrag flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-500 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors duration-200"
      onclick={addOption}
      aria-label="Add option"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
  
  <div class="picker-container">
    <button 
      class="select-button nodrag w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 dark:focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-sm flex justify-between items-center"
      onclick={toggleDropdown}
    >
      <span>{data.selectedOption}</span>
      <span class="text-orange-400 dark:text-orange-500 text-xs">▼</span>
    </button>
    
    {#if isOpen}
      <div class="options-list bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-md mt-1 max-h-32 overflow-y-auto z-10">
        {#each data.options as option, idx }
          <div class="option-item hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center justify-between px-2 py-1">
            <button class="option-button nodrag text-sm text-left w-full text-gray-800 dark:text-gray-200" onclick={() => selectOption(idx)}>{option}</button>
            {#if data.options.length > 1}
              <button 
                aria-label="Remove option"
                class="remove-btn nodrag text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                onclick={() => removeOption(option)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <Handle 
    type="source" 
    position={Position.Right} 
    class="w-2 h-2 bg-orange-400 dark:bg-orange-500 border-2 border-white dark:border-gray-800"
  />
</div>

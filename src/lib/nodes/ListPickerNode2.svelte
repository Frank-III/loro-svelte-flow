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
      { selected: index },
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

<div class="list-picker-node" class:active={isOpen}>
  <Handle type="target" position={Position.Left} />
  
  <div class="title">
    <input type="text" value={data.label} oninput={updateLabel} class="nodrag" />
    <button class="add-btn nodrag" onclick={addOption}>+</button>
  </div>
  
  <div class="picker-container">
    <button 
      class="select-button nodrag" 
      onclick={toggleDropdown}
    >
      {data.selectedOption}
      <span class="arrow">▼</span>
    </button>
    
    {#if isOpen}
      <div class="options-list">
        {#each data.options as option, idx }
          <div class="option-item">
            <button class="option-button nodrag" onclick={() => selectOption(idx)}>{option}</button>
            {#if data.options.length > 1}
              <button 
                class="remove-btn nodrag"
                onclick={() => removeOption(option)}
              >
                ×
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <Handle type="source" position={Position.Right} />
</div>

<style>
  .list-picker-node {
    padding: 10px;
    border-radius: 5px;
    background: white;
    border: 1px solid #ddd;
    min-width: 200px;
    position: relative;
  }

  .list-picker-node.active {
    z-index: 10;
  }

  .title {
    font-size: 12px;
    color: #777;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .picker-container {
    position: relative;
  }

  .select-button {
    width: 100%;
    padding: 8px 12px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }

  .select-button:hover {
    background: #eee;
  }

  .arrow {
    font-size: 10px;
    color: #666;
  }

  .options-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 4px;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .option-item {
    display: flex;
    align-items: center;
    padding: 4px 8px;
  }

  .option-input {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid transparent;
    border-radius: 3px;
    font-size: 12px;
    background: transparent;
  }

  .option-input:hover {
    border-color: #ddd;
  }

  .option-input:focus {
    border-color: #aaa;
    outline: none;
    background: white;
  }

  .add-btn, .remove-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 16px;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
  }

  .add-btn {
    color: #666;
    background: #eee;
  }

  .remove-btn {
    color: #ff4444;
    margin-left: 4px;
    font-size: 14px;
  }

  .add-btn:hover {
    background: #ddd;
  }

  .remove-btn:hover {
    color: #ff0000;
  }
</style>

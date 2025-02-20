<script lang="ts">
  import {
    SvelteFlow,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
    Panel,
    type Node,
    type Edge,
    type NodeTypes,
    useSvelteFlow,
		type NodeEventWithPointer,
		type NodeTargetEventWithPointer,
		useNodes,
  } from '@xyflow/svelte';
  import PartySocket from 'partysocket';
  import '@xyflow/svelte/dist/style.css';
  import { FlowDoc, setFlowDoc } from './LoroDoc.svelte';
  import Toolbar from './Toolbar.svelte';
  import TextNode from './nodes/TextNode.svelte';
  import TextListNode from './nodes/TextListNode.svelte';
  import MediaListNode from './nodes/MediaListNode.svelte';
  import ListPickerNode from './nodes/ListPickerNode.svelte';
  import { TextNodeData, TextListData, MediaListData, ListPickerData } from './nodes/node-types.svelte';
	import { onMount } from 'svelte';
  // Define node types
  const nodeTypes: NodeTypes = {
    text: TextNode,
    textList: TextListNode,
    mediaList: MediaListNode,
    picker: ListPickerNode
  };

  const isSyncing = $state(false);

  onMount(() => {
    const ws = new PartySocket({
      host: 'localhost:8787',
      room: '1',
      protocol: 'ws',
    })
  })

  let flowDoc: FlowDoc | undefined;
  $effect.pre(() => {
    flowDoc = setFlowDoc();
    const sub = flowDoc?.doc.subscribe((event) => {
      // get other peers versions and export updates
      console.dir(event, { depth: null })
      // console.log('version', flowDoc?.doc.version())
      // console.dir(flowDoc?.doc.toJSON(), { depth: null })
    })
    return sub
  })
  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);
  let toolbarPosition = $state({ x: 20, y: 20 }); // Default position
  
  const { screenToFlowPosition } = $derived(useSvelteFlow());
  
  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };
  
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    
    if (!event.dataTransfer) return;
    
    const type = event.dataTransfer.getData('application/nodeflow');
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    let data;
    const id = crypto.randomUUID();
    switch (type) {
      case 'text':
        data = new TextNodeData();
        break;
      case 'textList':
        data = new TextListData();
        break;
      case 'mediaList':
        data = new MediaListData();
        break;
      case 'picker':
        data = new ListPickerData();
        break;
      default:
        return {};
      }
    
    const newNode: Node = {
      id,
      type,
      position,
      data: data as any
    };
    
    nodes = [...nodes, newNode];
  };
  
  const onPaneContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    toolbarPosition = {
      x: event.clientX,
      y: event.clientY
    };
  };
  $inspect(nodes)
</script>

<SvelteFlow
  bind:nodes
  bind:edges
  {nodeTypes}
  fitView
  oncontextmenu={onPaneContextMenu}
  ondragover={onDragOver}
  ondrop={onDrop}
  onnodedragstop={({targetNode}) => {
    if (targetNode) {
      flowDoc?.modifyNodePosition(targetNode);
    }
  }}
  onconnect={(e) => {
    // console.log('connect', e)
    flowDoc?.addOrModifyEdge({
      id: crypto.randomUUID(),
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle
    })
  }}
  ondelete={(e) => {
    if (e.nodes.length > 0) {
      e.nodes.forEach(node => {
        flowDoc?.deleteNode(node);
      });
    }
    if (e.edges.length > 0) {
      e.edges.forEach(edge => {
        flowDoc?.deleteEdge(edge);
      });
    }
  }}
>
  <Controls />
  <Background variant={BackgroundVariant.Dots} />
  <MiniMap />
  <Panel 
    position="top-left" 
    class="animated-panel"
    style="transform: translate({toolbarPosition.x}px, {toolbarPosition.y}px);"
  >
    <Toolbar />
  </Panel>
</SvelteFlow>


<style>
  .animated-panel {
    transition: transform 0.3s ease-out;
  }
</style>

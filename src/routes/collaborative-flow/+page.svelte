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
  } from '@xyflow/svelte';
  import PartySocket from 'partysocket';
  import '@xyflow/svelte/dist/style.css';
  import { FlowDoc, setFlowDoc } from './LoroDoc.svelte';
  import Toolbar from './Toolbar.svelte';
  import TextNode from './nodes/TextNode2.svelte';
  import TextListNode from './nodes/TextListNode2.svelte';
  import MediaListNode from './nodes/MediaListNode2.svelte';
  import ListPickerNode from './nodes/ListPickerNode2.svelte';
  // import { TextNodeData, TextListData, MediaListData, ListPickerData } from './nodes/node-types.svelte';
	// import { onMount, untrack } from 'svelte';
  import { Spring } from 'svelte/motion';
	import { VersionVector } from 'loro-crdt';
	import { constructEdgesFromLoroMap, constructNodesFromLoroMap } from '@/utils';
	import type { ServerToClient } from 'common';
	import { onMount } from 'svelte';
  // Define node types
  const nodeTypes: NodeTypes = {
    text: TextNode,
    textList: TextListNode,
    mediaList: MediaListNode,
    picker: ListPickerNode
  };
  let vvs = $state<VersionVector>();

  let flowDoc: FlowDoc | undefined;
  $effect.root(() => {
    flowDoc = setFlowDoc();
    const ws = new PartySocket({
      host: 'localhost:8787',
      room: "my-room",
      protocol: 'ws',
    })
    ws.onopen = (event) => {
      console.log('open', event)
    }
    ws.onmessage = (event) => {
      const data: ServerToClient = JSON.parse(event.data);
      // console.log('data', data)
      if (data.type === 'version') {
        console.log('version', data.payload)
        vvs = VersionVector.decode(new Uint8Array(Object.values(data.payload)))
      } else if (data.type === 'delta-and-version') {
        console.log('delta-and-version', data.payload)
        vvs = VersionVector.decode(new Uint8Array(Object.values(data.payload.version)));
        try {
          flowDoc!.doc.import(new Uint8Array(Object.values(data.payload.delta)));
          flowDoc!.isSyncing = true;
          nodes = constructNodesFromLoroMap(flowDoc!.loroNodes);
          edges = constructEdgesFromLoroMap(flowDoc!.loroEdges);
        } finally {
          setTimeout(() => {
            flowDoc!.isSyncing = false;
          }, 0);
        }
      }
    }

    const sub = flowDoc?.doc.subscribeLocalUpdates((event) => {
      if (flowDoc!.isSyncing) return
          console.log('sending update', flowDoc?.doc.peerId)
          if (vvs) {
            const delta = flowDoc?.doc.export({mode: "update", from: vvs})
            if (delta) {
              ws?.send(delta.slice().buffer!)
            }
          }
    })
    return () => {
      sub?.();
      ws?.close();
    }
  })

  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);
  let springToolbarPosition = new Spring({ x: 20, y: 20 }, {
    stiffness: 0.1,
    damping: 0.5,
  })
  
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
    
    // Create data objects directly without using classes
    switch (type) {
      case 'text':
        data = { text: '' };
        break;
      case 'textList':
        data = { 
          label: '', 
          items: [{ id: crypto.randomUUID(), text: '' }] 
        };
        break;
      case 'mediaList':
        data = { 
          label: '', 
          items: [{ id: crypto.randomUUID(), text: '', imageUrl: '' }] 
        };
        break;
      case 'picker':
        data = { 
          label: '', 
          options: ["Option 1", "Option 2", "Option 3"], 
          selected: 0,
          get selectedOption() {
            return this.options[this.selected];
          }
        };
        break;
      default:
        return;
    }
    
    const newNode: Node = {
      id,
      type,
      position,
      data
    };
    
    nodes = [...nodes, newNode];

    flowDoc?.addOrModifyNodeData({
      id,
      data,
      position,
      type
    });
  };
  
  const onPaneContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    springToolbarPosition.set({
      x: event.clientX,
      y: event.clientY
    });
  };

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
  onconnectend={(e, state) => {
    // if not node is connected, move the toolbar to the location
    if (state.toHandle === null) {
      const position = springToolbarPosition.set({
        x: state.to?.x ?? 20,
        y: state.to?.y ?? 20
      });
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
    style="transform: translate({springToolbarPosition.current.x}px, {springToolbarPosition.current.y}px);"
  >
    <Toolbar />
  </Panel>
</SvelteFlow>


<style>
  .animated-panel {
    transition: transform 0.3s ease-out;
  }
</style>

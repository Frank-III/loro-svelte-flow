<script lang="ts">
  export let nodesCount: number;
  export let edgesCount: number;
  
  // Generate a deterministic but random-looking layout based on node count
  function generatePreviewData(nodeCount: number, edgeCount: number) {
    const nodes = [];
    const edges = [];
    
    // Determine how many nodes to show
    const maxVisibleChildNodes = 5; // Maximum number of child nodes to display (reduced to make room for ellipsis)
    const showEllipsis = nodeCount > maxVisibleChildNodes + 1; // +1 for root
    const showLastNode = showEllipsis && nodeCount > maxVisibleChildNodes + 2; // Show last node after ellipsis
    
    // How many child nodes to actually display (excluding the last one if showing ellipsis)
    const visibleChildNodes = showEllipsis 
      ? Math.min(maxVisibleChildNodes - (showLastNode ? 1 : 0), nodeCount - 1)
      : Math.min(nodeCount - 1, maxVisibleChildNodes);
    
    // Create root node
    nodes.push({
      id: 'root',
      x: 50,
      y: 25, // Positioned at top
      width: 16,
      height: 16,
      color: '#fb923c' // orange-400
    });
    
    // Calculate spacing for symmetric layout
    const totalWidth = 80; // Total width to use for nodes
    const nodeWidth = 10; // Width of each node
    const ellipsisWidth = 10; // Approximate width of ellipsis
    const padding = 5; // Padding between nodes and ellipsis
    
    let availableWidth, nodeSpacing;
    
    if (showLastNode) {
      // Space for: visible nodes + ellipsis + last node + padding
      availableWidth = totalWidth - (nodeWidth * (visibleChildNodes + 1)) - ellipsisWidth - (padding * 2);
      nodeSpacing = visibleChildNodes > 1 ? availableWidth / (visibleChildNodes - 1) : 0;
    } else if (showEllipsis) {
      // Space for: visible nodes + ellipsis + padding
      availableWidth = totalWidth - (nodeWidth * visibleChildNodes) - ellipsisWidth - padding;
      nodeSpacing = visibleChildNodes > 1 ? availableWidth / (visibleChildNodes - 1) : 0;
    } else {
      // Space for just the visible nodes
      availableWidth = totalWidth - (nodeWidth * visibleChildNodes);
      nodeSpacing = visibleChildNodes > 1 ? availableWidth / (visibleChildNodes - 1) : 0;
    }
    
    // Calculate starting X position for symmetric layout
    const startX = (100 - totalWidth) / 2 + nodeWidth / 2;
    
    // Add visible child nodes
    for (let i = 0; i < visibleChildNodes; i++) {
      const x = startX + (i * (nodeWidth + nodeSpacing));
      const y = 75; // All child nodes at the same level
      
      nodes.push({
        id: `node-${i+1}`,
        x,
        y,
        width: nodeWidth,
        height: nodeWidth,
        color: '#fdba74' // orange-300
      });
      
      // Connect to root with bezier path
      edges.push({
        source: 'root',
        target: `node-${i+1}`,
        color: '#fed7aa' // orange-200
      });
    }
    
    // Calculate ellipsis position with padding
    const ellipsisX = showLastNode 
      ? startX + (visibleChildNodes * (nodeWidth + nodeSpacing)) + padding + (ellipsisWidth / 2)
      : startX + (visibleChildNodes * (nodeWidth + nodeSpacing)) + padding + (ellipsisWidth / 2);
    
    // Add last node if needed
    if (showLastNode) {
      const lastNodeX = ellipsisX + (ellipsisWidth / 2) + padding + (nodeWidth / 2);
      
      nodes.push({
        id: 'last-node',
        x: lastNodeX,
        y: 75,
        width: nodeWidth,
        height: nodeWidth,
        color: '#fdba74' // orange-300
      });
      
      // Connect to root
      edges.push({
        source: 'root',
        target: 'last-node',
        color: '#fed7aa' // orange-200
      });
    }
    
    return { 
      nodes, 
      edges, 
      showEllipsis,
      ellipsisX
    };
  }
  
  const { nodes, edges, showEllipsis, ellipsisX } = generatePreviewData(nodesCount, edgesCount);
</script>

<svg viewBox="0 0 100 100" class="w-full h-full">
  <!-- Draw edges first so they're behind nodes -->
  {#each edges as edge}
    {@const source = nodes.find(n => n.id === edge.source)}
    {@const target = nodes.find(n => n.id === edge.target)}
    {#if source && target}
      <path 
        d="M {source.x} {source.y + source.height/2} 
           C {source.x} {source.y + 20}, 
             {target.x} {target.y - 20}, 
             {target.x} {target.y - target.height/2}"
        fill="none"
        stroke={edge.color}
        stroke-width="1"
        class="transition-colors duration-200 dark:stroke-orange-300"
      />
    {/if}
  {/each}
  
  <!-- Draw nodes as rounded rectangles -->
  {#each nodes as node}
    <rect 
      x={node.x - node.width/2} 
      y={node.y - node.height/2} 
      width={node.width} 
      height={node.height}
      rx="3" 
      ry="3"
      fill={node.color}
      class="transition-colors duration-200 dark:fill-orange-400"
    />
  {/each}
  
  <!-- Show ellipsis if needed -->
  {#if showEllipsis}
    <text x={ellipsisX} y="75" text-anchor="middle" class="text-xs fill-gray-500 dark:fill-gray-300">...</text>
  {/if}
</svg> 

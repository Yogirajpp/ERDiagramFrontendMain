import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  Panel,
} from 'reactflow';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useDiagram } from '@/contexts/DiagramContext';
import CodeViewer from './CodeViewer';
import EntityNode from './EntityNode';
import RelationshipEdge from './RelationshipEdge';

// Define node types
const nodeTypes = {
  entity: EntityNode,
};

// Define edge types
const edgeTypes = {
  relationship: RelationshipEdge,
};

const DiagramCanvas = () => {
  const { 
    activeTab,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
    setReactFlowInstance,
    reactFlowInstance,
    setSelectedNode,
    setSelectedEdge,
    setSidebarMode,
    selectedNode,
    diagramId,
    mongoDBSchema,
    setMongoDBSchema,
    diagram
  } = useDiagram();
  
  const reactFlowWrapper = useRef(null);
  
  // Handle node click
  const onNodeClick = (event, node) => {
    event.preventDefault();
    setSelectedEdge(null);
    setSelectedNode(node);
    setSidebarMode('entity');
  };

  // Handle edge click
  const onEdgeClick = (event, edge) => {
    event.preventDefault();
    setSelectedNode(null);
    setSelectedEdge(edge);
    setSidebarMode('relationship');
  };

  // Handle pane click (deselect everything)
  const onPaneClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setSidebarMode('none');
  };

  // Handle drag over (for dropping new entities)
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop (create new entity)
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      const type = event.dataTransfer.getData('application/reactflow');
      
      // Check if the dropped element is our custom type
      if (type === 'entity' && reactFlowInstance) {
        // Get position of drop
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        
        // Show entity form for creating new entity
        setSelectedNode({ position });
        setSidebarMode('new-entity');
      }
    },
    [reactFlowInstance, setSelectedNode, setSidebarMode]
  );

  // Drag start handler for toolbar items
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Create relationship
  const handleCreateRelationship = () => {
    setSidebarMode('new-relationship');
  };

  // Export diagram as image
  const handleExportImage = () => {
    if (reactFlowInstance) {
      // Get the ReactFlow pane
      const flowElement = document.querySelector('.react-flow__pane');
      if (!flowElement) return;
      
      // Create invisible elements for styling the exported image
      const exportBackground = document.createElement('div');
      exportBackground.style.position = 'absolute';
      exportBackground.style.zIndex = '-1';
      exportBackground.style.top = '0';
      exportBackground.style.left = '0';
      exportBackground.style.width = '100%';
      exportBackground.style.height = '100%';
      exportBackground.style.backgroundColor = '#fff';
      
      // Add temporary background for export
      flowElement.appendChild(exportBackground);
      
      // Create canvas from ReactFlow
      reactFlowInstance.toImage({ 
        download: true, 
        fileName: `${diagram?.name || 'diagram'}.png` 
      });
      
      // Remove the temporary background
      setTimeout(() => {
        flowElement.removeChild(exportBackground);
      }, 500);
    }
  };

  // Update MongoDB schema
  const handleUpdateSchema = async (schemaCode) => {
    setMongoDBSchema(schemaCode);
    // The actual API call would be handled in the DiagramContext
  };

  return (
    <div className="flex-1">
      <Tabs value={activeTab} className="h-full flex flex-col">
        <TabsContent value="diagram" className="flex-1 relative h-full">
          <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-900 shadow-lg rounded-lg border">
            <div className="p-3">
              <h3 className="text-sm font-medium mb-2">Add Components</h3>
              <div 
                className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 cursor-grab"
                draggable
                onDragStart={(event) => onDragStart(event, 'entity')}
              >
                <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                <span className="text-sm">Entity</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full flex justify-center rounded-none border-t"
              onClick={handleCreateRelationship}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Relationship
            </Button>
          </div>
          
          <div ref={reactFlowWrapper} className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background gap={16} size={1} />
              
              <Panel position="bottom-right" className="bg-white dark:bg-gray-900 p-2 rounded shadow">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleExportImage}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Image
                </Button>
              </Panel>
            </ReactFlow>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 relative h-full">
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              nodesConnectable={false}
              elementsSelectable={false}
              nodesDraggable={false}
            >
              <Controls showInteractive={false} />
              <MiniMap />
              <Background gap={16} size={1} />
            </ReactFlow>
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 h-full">
          <CodeViewer 
            code={mongoDBSchema} 
            onChange={handleUpdateSchema}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiagramCanvas;
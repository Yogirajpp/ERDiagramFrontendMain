import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  Panel,
} from 'reactflow';
import { Plus, Download, Database, Link, Code, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDiagram } from '@/contexts/DiagramContext';
import CodeViewer from './CodeViewer';
import EntityNode from './EntityNode';
import RelationshipEdge from './RelationshipEdge';
import useEntities from '@/hooks/useEntities';
import useRelationships from '@/hooks/useRelationships';

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
  
  const { createEntity } = useEntities();
  const { createRelationship } = useRelationships();
  
  const reactFlowWrapper = useRef(null);
  
  // Local state for dialogs and popovers
  const [newEntityDialog, setNewEntityDialog] = useState(false);
  const [newEntityData, setNewEntityData] = useState({
    name: '',
    type: 'regular',
    position: { x: 100, y: 100 }
  });
  
  const [newRelationshipDialog, setNewRelationshipDialog] = useState(false);
  const [newRelationshipData, setNewRelationshipData] = useState({
    name: '',
    sourceId: '',
    targetId: '',
    type: 'one-to-many'
  });
  
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
        
        // Open new entity dialog with position
        setNewEntityData({ ...newEntityData, position });
        setNewEntityDialog(true);
      }
    },
    [reactFlowInstance, newEntityData]
  );

  // Drag start handler for toolbar items
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Create entity
  const handleCreateEntity = () => {
    if (newEntityData.name.trim()) {
      createEntity(
        { name: newEntityData.name, type: newEntityData.type },
        newEntityData.position
      );
      setNewEntityDialog(false);
      setNewEntityData({
        name: '',
        type: 'regular',
        position: { x: 100, y: 100 }
      });
    }
  };

  // Create relationship
  const handleCreateRelationship = () => {
    if (!newRelationshipData.name.trim() || !newRelationshipData.sourceId || !newRelationshipData.targetId) return;
    
    // Set cardinality based on relationship type
    let sourceCardinality = '1';
    let targetCardinality = 'n';
    
    if (newRelationshipData.type === 'one-to-one') {
      targetCardinality = '1';
    } else if (newRelationshipData.type === 'many-to-many') {
      sourceCardinality = 'n';
    }
    
    createRelationship({
      ...newRelationshipData,
      sourceCardinality,
      targetCardinality,
      sourceParticipation: 'partial',
      targetParticipation: 'partial',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION'
    });
    
    setNewRelationshipDialog(false);
    setNewRelationshipData({
      name: '',
      sourceId: '',
      targetId: '',
      type: 'one-to-many'
    });
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

  // Handle context menu for right-click on canvas
  const handleContextMenu = (event) => {
    event.preventDefault();
    if (reactFlowInstance) {
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setNewEntityData({ ...newEntityData, position });
      setNewEntityDialog(true);
    }
  };

  return (
    <div className="flex-1">
      <Tabs value={activeTab} className="h-full flex flex-col">
        <TabsContent value="diagram" className="flex-1 relative h-full">
          {/* Floating action buttons */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" className="rounded-full h-10 w-10 shadow-md">
                  <Plus className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" side="left">
                <div className="p-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm h-9"
                    onClick={() => setNewEntityDialog(true)}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Add Table
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm h-9"
                    onClick={() => setNewRelationshipDialog(true)}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Add Relationship
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm h-9"
                    onClick={handleExportImage}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Image
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Entity creation dialog */}
          <Dialog open={newEntityDialog} onOpenChange={setNewEntityDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Table</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Table Name</label>
                  <Input
                    value={newEntityData.name}
                    onChange={(e) => setNewEntityData({...newEntityData, name: e.target.value})}
                    placeholder="Enter table name"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Table Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={newEntityData.type === 'regular' ? 'default' : 'outline'}
                      className="text-center text-sm h-9"
                      onClick={() => setNewEntityData({...newEntityData, type: 'regular'})}
                    >
                      Regular
                    </Button>
                    <Button
                      type="button"
                      variant={newEntityData.type === 'weak' ? 'default' : 'outline'}
                      className="text-center text-sm h-9"
                      onClick={() => setNewEntityData({...newEntityData, type: 'weak'})}
                    >
                      Weak
                    </Button>
                    <Button
                      type="button"
                      variant={newEntityData.type === 'associative' ? 'default' : 'outline'}
                      className="text-center text-sm h-9"
                      onClick={() => setNewEntityData({...newEntityData, type: 'associative'})}
                    >
                      Junction
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewEntityDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateEntity} disabled={!newEntityData.name.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Relationship creation dialog */}
          <Dialog open={newRelationshipDialog} onOpenChange={setNewRelationshipDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Relationship</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Relationship Name</label>
                  <Input
                    value={newRelationshipData.name}
                    onChange={(e) => setNewRelationshipData({...newRelationshipData, name: e.target.value})}
                    placeholder="Enter relationship name"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Table</label>
                    <select
                      value={newRelationshipData.sourceId}
                      onChange={(e) => setNewRelationshipData({...newRelationshipData, sourceId: e.target.value})}
                      className="w-full p-2 border rounded bg-background"
                    >
                      <option value="">Select source</option>
                      {nodes.map(node => (
                        <option key={node.id} value={node.id}>
                          {node.data.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Table</label>
                    <select
                      value={newRelationshipData.targetId}
                      onChange={(e) => setNewRelationshipData({...newRelationshipData, targetId: e.target.value})}
                      className="w-full p-2 border rounded bg-background"
                      disabled={!newRelationshipData.sourceId}
                    >
                      <option value="">Select target</option>
                      {nodes
                        .filter(node => node.id !== newRelationshipData.sourceId)
                        .map(node => (
                          <option key={node.id} value={node.id}>
                            {node.data.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Relationship Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={newRelationshipData.type === 'one-to-one' ? 'default' : 'outline'}
                      className="text-center text-sm h-9"
                      onClick={() => setNewRelationshipData({...newRelationshipData, type: 'one-to-one'})}
                    >
                      One-to-One
                    </Button>
                    <Button
                      type="button"
                      variant={newRelationshipData.type === 'one-to-many' ? 'default' : 'outline'}
                      className="text-center text-sm h-9"
                      onClick={() => setNewRelationshipData({...newRelationshipData, type: 'one-to-many'})}
                    >
                      One-to-Many
                    </Button>
                    <Button
                      type="button"
                      variant={newRelationshipData.type === 'many-to-many' ? 'default' : 'outline'}
                      className="text-center text-sm h-9"
                      onClick={() => setNewRelationshipData({...newRelationshipData, type: 'many-to-many'})}
                    >
                      Many-to-Many
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewRelationshipDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateRelationship} 
                  disabled={!newRelationshipData.name.trim() || !newRelationshipData.sourceId || !newRelationshipData.targetId}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div 
            ref={reactFlowWrapper} 
            className="w-full h-full"
            onContextMenu={handleContextMenu}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={(params) => setEdges((eds) => addEdge({ ...params, type: 'relationship' }, eds))}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              defaultEdgeOptions={{ type: 'relationship' }}
            >
              <Controls />
              <MiniMap />
              <Background gap={16} size={1} />
              
              {/* Left toolbar for drag and drop entity creation */}
              <Panel position="top-left" className="bg-white dark:bg-gray-900 p-2 rounded shadow ml-2 mt-2">
                <div className="text-sm font-medium mb-2">Add Components</div>
                <div 
                  className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 cursor-grab mb-2"
                  draggable
                  onDragStart={(event) => onDragStart(event, 'entity')}
                >
                  <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                  <span className="text-sm">Drag to Canvas</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full flex justify-center"
                  onClick={() => setNewRelationshipDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Relationship
                </Button>
              </Panel>
              
              {/* Bottom status panel with diagram info */}
              <Panel position="bottom-center" className="bg-white dark:bg-gray-900 p-2 rounded shadow mb-2">
                <div className="flex items-center space-x-4 text-xs">
                  <div>Tables: {nodes.length}</div>
                  <div>Relationships: {edges.length}</div>
                  <div>Diagram: {diagram?.name || 'Untitled'}</div>
                  <div className="text-muted-foreground">Right-click on canvas to add table</div>
                </div>
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
              
              {/* Info message that this is read-only view */}
              <Panel position="top-center" className="bg-white dark:bg-gray-900 p-2 rounded shadow mt-2">
                <div className="text-sm text-center">
                  Preview Mode (Read-only) - Switch to Diagram tab to make changes
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 h-full">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium">MongoDB Schema</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => document.getElementById('codeViewer').requestFullscreen()}>
                <Code className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
              <Button size="sm" variant="default" onClick={() => {
                // Copy code to clipboard
                navigator.clipboard.writeText(mongoDBSchema)
                  .then(() => alert("Code copied to clipboard!"))
                  .catch(err => console.error('Failed to copy:', err));
              }}>
                Copy Code
              </Button>
            </div>
          </div>
          
          <div id="codeViewer" className="h-full border rounded-md overflow-hidden">
            <CodeViewer 
              code={mongoDBSchema} 
              onChange={handleUpdateSchema}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiagramCanvas;
import React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { useDiagram } from '@/contexts/DiagramContext';
import useEntities from '@/hooks/useEntities';
import useAttributes from '@/hooks/useAttributes';
import useRelationships from '@/hooks/useRelationships';

import EntityForm from './EntityForm';
import AttributeForm from './AttributeForm';
import RelationshipForm from './RelationshipForm';
import DiagramSettings from './DiagramSettings';

const DiagramSidebar = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarMode,
    setSidebarMode,
    selectedNode,
    setSelectedNode,
    selectedEdge,
    diagram,
    nodes
  } = useDiagram();
  
  const { updateEntity, deleteEntity, createEntity } = useEntities();
  const { createAttribute, updateAttribute, deleteAttribute } = useAttributes();
  const { updateRelationship, deleteRelationship, createRelationship } = useRelationships();

  // New entity form component
  const NewEntityForm = () => {
    const [name, setName] = React.useState('New Entity');
    const [type, setType] = React.useState('regular');
    
    const handleCreate = () => {
      createEntity({ name, type }, selectedNode.position);
    };
    
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Create New Entity</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entityName">Entity Name</Label>
            <Input
              id="entityName"
              placeholder="Enter entity name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entityType">Entity Type</Label>
            <select
              id="entityType"
              className="w-full p-2 border rounded bg-background"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="regular">Regular Entity</option>
              <option value="weak">Weak Entity</option>
              <option value="associative">Associative Entity</option>
            </select>
          </div>
          
          <div className="pt-4 space-x-2 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedNode(null);
                setSidebarMode('none');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Entity
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Empty state component
  const EmptySidebar = () => (
    <div className="p-4 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
      <p>Select an element on the diagram to edit its properties</p>
    </div>
  );
  
  // Toggle sidebar button when sidebar is closed
  const SidebarToggle = () => (
    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
      <Button
        variant="secondary"
        size="sm"
        className="h-20 w-6 rounded-l-md rounded-r-none border border-r-0 shadow-sm flex items-center justify-center"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
    </div>
  );

  // If sidebar is closed, just show the toggle button
  if (!sidebarOpen) {
    return <SidebarToggle />;
  }

  return (
    <div className="w-80 border-l bg-white dark:bg-gray-900 overflow-y-auto relative">
      {/* Sidebar header with title and close button */}
      <div className="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
        <h2 className="font-medium">Properties</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="pt-2">
        {sidebarMode === 'none' && <EmptySidebar />}
        
        {sidebarMode === 'entity' && selectedNode && (
          <EntityForm
            entity={selectedNode}
            onUpdate={updateEntity}
            onDelete={() => deleteEntity(selectedNode.id)}
            onAddAttribute={() => setSidebarMode('new-attribute')}
            onUpdateAttribute={updateAttribute}
            onDeleteAttribute={deleteAttribute}
          />
        )}
        
        {sidebarMode === 'new-entity' && selectedNode && <NewEntityForm />}
        
        {sidebarMode === 'new-attribute' && selectedNode && (
          <AttributeForm
            entityId={selectedNode.id}
            onSave={(attributeData) => createAttribute(selectedNode.id, attributeData)}
            onCancel={() => setSidebarMode('entity')}
          />
        )}
        
        {sidebarMode === 'relationship' && selectedEdge && (
          <RelationshipForm
            relationship={selectedEdge}
            nodes={nodes}
            onSave={(relationshipData) => updateRelationship(selectedEdge.id, relationshipData)}
            onDelete={() => deleteRelationship(selectedEdge.id)}
            onCancel={() => setSidebarMode('none')}
          />
        )}
        
        {sidebarMode === 'new-relationship' && (
          <RelationshipForm
            nodes={nodes}
            onSave={createRelationship}
            onCancel={() => setSidebarMode('none')}
          />
        )}
        
        {sidebarMode === 'settings' && (
          <DiagramSettings
            diagram={diagram}
            onUpdate={(settingsData) => {
              // Update diagram settings would be handled in DiagramContext
              console.log("Updating diagram settings:", settingsData);
              setSidebarMode('none');
            }}
            onBack={() => setSidebarMode('none')}
          />
        )}
      </div>
    </div>
  );
};

export default DiagramSidebar;
import React, { useState } from 'react';
import { ChevronsLeft, ChevronsRight, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { useDiagram } from '@/contexts/DiagramContext';
import useEntities from '@/hooks/useEntities';
import useAttributes from '@/hooks/useAttributes';
import useRelationships from '@/hooks/useRelationships';

const DiagramSidebar = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    selectedNode,
    setSelectedNode,
    selectedEdge,
    setSelectedEdge,
    diagram,
    nodes
  } = useDiagram();
  
  const { updateEntity, deleteEntity, createEntity } = useEntities();
  const { createAttribute, updateAttribute, deleteAttribute } = useAttributes();
  const { updateRelationship, deleteRelationship, createRelationship } = useRelationships();

  // Entity creation form state
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState('regular');
  
  // Attribute creation form states
  const [expandedEntity, setExpandedEntity] = useState(null);
  const [newAttributeData, setNewAttributeData] = useState({
    name: '',
    dataType: 'String',
    isPrimaryKey: false
  });
  
  // Relationship creation form state
  const [newRelationshipData, setNewRelationshipData] = useState({
    name: '',
    sourceId: '',
    targetId: '',
    type: 'one-to-many'
  });

  // Handle entity creation
  const handleCreateEntity = (e) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;
    
    createEntity(
      { name: newEntityName, type: newEntityType }, 
      { x: 200, y: 200 }
    );
    
    setNewEntityName('');
  };

  // Handle attribute creation
  const handleCreateAttribute = (entityId, e) => {
    e.preventDefault();
    if (!newAttributeData.name.trim()) return;
    
    createAttribute(entityId, newAttributeData);
    
    setNewAttributeData({
      name: '',
      dataType: 'String',
      isPrimaryKey: false
    });
  };

  // Handle attribute deletion
  const handleDeleteAttribute = async (entityId, attributeId) => {
    if (window.confirm("Delete this column?")) {
      try {
        const success = await deleteAttribute(entityId, attributeId);
        if (!success) {
          console.error("Failed to delete attribute");
        }
      } catch (error) {
        console.error("Error deleting attribute:", error);
      }
    }
  };

  // Handle relationship creation
  const handleCreateRelationship = (e) => {
    e.preventDefault();
    if (!newRelationshipData.name || !newRelationshipData.sourceId || !newRelationshipData.targetId) return;
    
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
    
    setNewRelationshipData({
      name: '',
      sourceId: '',
      targetId: '',
      type: 'one-to-many'
    });
  };

  // Toggle entity expansion to show/hide attribute form
  const toggleEntityExpansion = (entityId) => {
    setExpandedEntity(expandedEntity === entityId ? null : entityId);
  };

  // Sidebar toggle button when sidebar is closed
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
    <div className="w-96 border-l bg-white dark:bg-gray-900 overflow-hidden relative h-full flex flex-col">
      {/* Sidebar header with title and close button */}
      <div className="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
        <h2 className="font-medium">Database Designer</h2>
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
      
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="create" className="flex-1 flex flex-col">
          <div className="bg-slate-50 dark:bg-slate-900 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="create" className="flex-1">Create</TabsTrigger>
              <TabsTrigger value="select" className="flex-1">Tables</TabsTrigger>
            </TabsList>
          </div>
          
          {/* CREATE TAB - Quick creation forms */}
          <TabsContent value="create" className="p-4 flex-1 overflow-auto space-y-6">
            {/* Quick Entity Creation */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Create Table</h3>
              <form onSubmit={handleCreateEntity} className="space-y-3">
                <Input
                  value={newEntityName}
                  onChange={(e) => setNewEntityName(e.target.value)}
                  placeholder="Table name"
                  className="flex-1"
                  autoComplete="off"
                />
                
                <select
                  value={newEntityType}
                  onChange={(e) => setNewEntityType(e.target.value)}
                  className="w-full p-2 border rounded bg-background"
                >
                  <option value="regular">Regular Table</option>
                  <option value="weak">Weak Entity</option>
                  <option value="associative">Junction Table</option>
                </select>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!newEntityName.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Table
                </Button>
              </form>
            </div>

            <Separator />
            
            {/* Quick Relationship Creation */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Create Relationship</h3>
              <form onSubmit={handleCreateRelationship} className="space-y-3">
                <Input
                  value={newRelationshipData.name}
                  onChange={(e) => setNewRelationshipData({...newRelationshipData, name: e.target.value})}
                  placeholder="Relationship name"
                  className="w-full"
                  autoComplete="off"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newRelationshipData.sourceId}
                    onChange={(e) => setNewRelationshipData({...newRelationshipData, sourceId: e.target.value})}
                    className="p-2 border rounded bg-background"
                  >
                    <option value="">Source table</option>
                    {nodes.map(node => (
                      <option key={node.id} value={node.id}>
                        {node.data.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={newRelationshipData.targetId}
                    onChange={(e) => setNewRelationshipData({...newRelationshipData, targetId: e.target.value})}
                    className="p-2 border rounded bg-background"
                  >
                    <option value="">Target table</option>
                    {nodes
                      .filter(node => node.id !== newRelationshipData.sourceId)
                      .map(node => (
                        <option key={node.id} value={node.id}>
                          {node.data.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className={`p-2 border rounded text-center ${newRelationshipData.type === 'one-to-one' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-slate-800'}`}
                    onClick={() => setNewRelationshipData({...newRelationshipData, type: 'one-to-one'})}
                  >
                    {/* <span className="font-medium">One-to-One</span */}
                    <div className="text-md text-muted-foreground mt-1">1:1</div>
                  </button>
                  
                  <button
                    type="button"
                    className={`p-2 border rounded text-center ${newRelationshipData.type === 'one-to-many' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-slate-800'}`}
                    onClick={() => setNewRelationshipData({...newRelationshipData, type: 'one-to-many'})}
                  >
                    {/* <span className="font-medium">One-to-Many</span> */}
                    <div className="text-md text-muted-foreground mt-1">1:N</div>
                  </button>
                  
                  <button
                    type="button"
                    className={`p-2 border rounded text-center ${newRelationshipData.type === 'many-to-many' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-slate-800'}`}
                    onClick={() => setNewRelationshipData({...newRelationshipData, type: 'many-to-many'})}
                  >
                    {/* <span className="font-medium">Many-to-Many</span> */}
                    <div className="text-md text-muted-foreground mt-1">N:N</div>
                  </button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!newRelationshipData.name || !newRelationshipData.sourceId || !newRelationshipData.targetId}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Relationship
                </Button>
              </form>
            </div>
          </TabsContent>
          
          {/* SELECT TAB - List of entities with expandable attribute forms */}
          <TabsContent value="select" className="flex-1 overflow-auto">
            {nodes.length > 0 ? (
              <div className="max-h-[90%] overflow-auto p-2">
                {nodes.map(node => (
                  <div key={node.id} className="border-b rounded-md bg-white dark:bg-slate-800 overflow-hidden">
                    {/* Entity Header - Clickable to expand/collapse */}
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 border-b"
                      onClick={() => toggleEntityExpansion(node.id)}
                    >
                      <div className="flex items-center">
                        {expandedEntity === node.id ? 
                          <ChevronDown className="h-4 w-4 mr-2" /> : 
                          <ChevronRight className="h-4 w-4 mr-2" />
                        }
                        <span className="font-medium">{node.data.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {node.data.attributes?.length || 0} columns
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete table "${node.data.name}"?`)) {
                              deleteEntity(node.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Expanded Entity Content - Attribute List and Form */}
                    {expandedEntity === node.id && (
                      <div className="p-3 space-y-3">
                        {/* Current Attributes */}
                        <div className="max-h-[200px] overflow-auto">
                          {node.data.attributes && node.data.attributes.length > 0 ? (
                            <div className="rounded border overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                  <tr>
                                    <th className="p-2 text-left">Name</th>
                                    <th className="p-2 text-left">Type</th>
                                    <th className="p-2 text-center">PK</th>
                                    <th className="p-2 text-center">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {node.data.attributes.map(attr => (
                                    <tr key={attr._id} className="border-t">
                                      <td className="p-2">{attr.name}</td>
                                      <td className="p-2">{attr.dataType}</td>
                                      <td className="p-2 text-center">
                                        {attr.isPrimaryKey ? '✓' : ''}
                                      </td>
                                      <td className="p-2 text-center">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0 text-red-500"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent expansion toggle
                                            handleDeleteAttribute(node.id, attr._id);
                                          }}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-2 text-muted-foreground text-sm">
                              No columns defined
                            </div>
                          )}
                        </div>
                        
                        {/* Quick Attribute Creation Form */}
                        <form onSubmit={(e) => handleCreateAttribute(node.id, e)} className="space-y-3 mt-4 border-t pt-4">
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-5">
                              <Input
                                value={newAttributeData.name}
                                onChange={(e) => setNewAttributeData({...newAttributeData, name: e.target.value})}
                                placeholder="Column name"
                                className="w-full"
                              />
                            </div>
                            
                            <div className="col-span-5">
                              <select
                                value={newAttributeData.dataType}
                                onChange={(e) => setNewAttributeData({...newAttributeData, dataType: e.target.value})}
                                className="w-full p-2 border rounded bg-background"
                              >
                                <option value="String">String</option>
                                <option value="Number">Number</option>
                                <option value="Boolean">Boolean</option>
                                <option value="Date">Date</option>
                                <option value="varchar">varchar</option>
                                <option value="int">int</option>
                                <option value="text">text</option>
                                <option value="datetime">datetime</option>
                              </select>
                            </div>
                            
                            <div className="col-span-2 flex items-center justify-center">
                              <label className="flex items-center space-x-1 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={newAttributeData.isPrimaryKey}
                                  onChange={(e) => setNewAttributeData({...newAttributeData, isPrimaryKey: e.target.checked})}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-xs">PK</span>
                              </label>
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            size="sm"
                            className="w-full"
                            disabled={!newAttributeData.name.trim()}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Column
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No tables in your diagram yet</p>
                  <Button onClick={() => document.querySelector('[data-value="create"]').click()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create your first table
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default DiagramSidebar;
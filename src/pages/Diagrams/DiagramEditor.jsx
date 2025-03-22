import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Settings, 
  Code, 
  Eye, 
  Edit, 
  Trash,
  Download,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { attributesAPI, diagramsAPI, entitiesAPI, projectsAPI, relationshipsAPI } from '@/lib/api';
import { PageLoading } from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

// Import custom node and edge components
import EntityNode from '@/components/diagrams/EntityNode';
import RelationshipEdge from '@/components/diagrams/RelationshipEdge';
import EntityForm from '@/components/diagrams/EntityForm';
import AttributeForm from '@/components/diagrams/AttributeForm';
import RelationshipForm from '@/components/diagrams/RelationshipForm';
import DiagramSettings from '@/components/diagrams/DiagramSettings';
import CodeViewer from '@/components/diagrams/CodeViewer';
import BASE_URL from '@/lib/baseUrl';

// Define node types
const nodeTypes = {
  entity: EntityNode,
};

// Define edge types
const edgeTypes = {
  relationship: RelationshipEdge,
};

const DiagramEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [diagram, setDiagram] = useState(null);
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'diagram');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [sidebarMode, setSidebarMode] = useState('none'); // none, entity, attribute, relationship, settings
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [mongoDBSchema, setMongoDBSchema] = useState('');

  // Load diagram data
  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        setLoading(true);
        const response = await diagramsAPI.getById(id);
        const diagramData = response.data.data;
        setDiagram(diagramData);
        
        // Get project info
        if (diagramData.projectId) {
            const projectResponse = await projectsAPI.getById(diagramData.projectId);
            setProject(projectResponse.data.data);
        }
        
        // Initialize nodes and edges
        const diagramNodes = [];
        const diagramEdges = [];
        
        // Process entities (nodes)
        if (diagramData.entities && diagramData.entities.length > 0) {
          diagramData.entities.forEach(entity => {
            diagramNodes.push({
              id: entity._id,
              type: 'entity',
              position: entity.position,
              data: {
                name: entity.name,
                type: entity.type,
                attributes: entity.attributes,
                style: entity.style
              }
            });
          });
        }
        
        // Process relationships (edges)
        if (diagramData.relationships && diagramData.relationships.length > 0) {
          diagramData.relationships.forEach(relationship => {
            if (relationship.entities.length >= 2) {
              // Create an edge between the first two entities
              const sourceId = relationship.entities[0].entityId._id;
              const targetId = relationship.entities[1].entityId._id;
              
              diagramEdges.push({
                id: relationship._id,
                source: sourceId,
                target: targetId,
                type: 'relationship',
                data: {
                  name: relationship.name,
                  type: relationship.type,
                  entities: relationship.entities,
                  style: relationship.style
                }
              });
            }
          });
        }
        
        setNodes(diagramNodes);
        setEdges(diagramEdges);
        
        // Get MongoDB schema if available
        if (diagramData.mongoDBSchemaCode) {
          setMongoDBSchema(diagramData.mongoDBSchemaCode);
        } else if (diagramData.entities?.length > 0) {
          // Generate schema if it doesn't exist but entities do
          const schemaResponse = await diagramsAPI.generateSchema(id);
          setMongoDBSchema(schemaResponse.data.data.schemaCode);
        }
      } catch (err) {
        console.error('Error loading diagram:', err);
        setError('Failed to load diagram. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiagram();
  }, [id]);

  // Save diagram data
  const saveDiagram = async () => {
    try {
      setLoading(true);
      console.log('Saving diagram...');
      
      // Update entity positions in batches to improve performance
      const entityUpdatePromises = nodes.map(node => {
        if (node.type === 'entity') {
          return entitiesAPI.update(node.id, {
            position: node.position
          });
        }
        return Promise.resolve();
      });
      
      console.log('Updating entity positions...');
      // Wait for all entity position updates to complete
      await Promise.all(entityUpdatePromises);

      console.log('Updating relationship positions...');
      
      // Calculate and update relationship positions
      const relationshipUpdatePromises = edges.map(edge => {
        if (edge.type === 'relationship') {
          // Find source and target nodes
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          if (sourceNode && targetNode) {
            const position = {
              x: (sourceNode.position.x + targetNode.position.x) / 2,
              y: (sourceNode.position.y + targetNode.position.y) / 2
            };
            
            return relationshipsAPI.update(edge.id, { position });
          }
        }
        return Promise.resolve();
      });
      
      // Wait for all relationship position updates to complete
      await Promise.all(relationshipUpdatePromises);

      console.log('Updating diagram layout...');
      
      // Create the layout data object with the current state
      const layoutData = {
        layout: {
          nodes: nodes.map(n => ({ 
            id: n.id, 
            position: n.position,
            type: n.type 
          })),
          edges: edges.map(e => ({ 
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type
          })),
          viewport: reactFlowInstance ? reactFlowInstance.getViewport() : null
        }
      };

      console.log('Saving layout data:', layoutData);
      
      console.log(id)
      // Ensure we have a valid diagram ID before trying to update
      if (!id) {
        // Create new diagram if no ID exists
        const response = await diagramsAPI.create({
          ...layoutData,
          name: diagram?.name || 'New Diagram',
          description: diagram?.description || '',
          projectId: diagram?.projectId || project?._id
        });
        console.log('Diagram created:');
        console.log(response)
        
        // If successful, navigate to the new diagram's editor
        if (response.data && response.data.data) {
          const newDiagramId = response.data.data._id;
          showSuccess('Diagram created', 'New diagram has been created successfully');
          navigate(`/diagrams/${newDiagramId}/edit`);
        }
      } else {
        // Update existing diagram
        console.log('Diagram saved');
        await diagramsAPI.update(id, layoutData);
        console.log('Diagram updated');
        
        // Refresh MongoDB schema after saving
        if (nodes.length > 0) {
          try {
            const schemaResponse = await diagramsAPI.generateSchema(id);
            if (schemaResponse.data && schemaResponse.data.data) {
              setMongoDBSchema(schemaResponse.data.data.schemaCode);
            }
          } catch (schemaErr) {
            console.warn('Non-critical error updating schema:', schemaErr);
            // We don't want to fail the whole save operation if schema generation fails
          }
        }
        
        showSuccess('Diagram saved', 'All changes have been saved successfully');
      }
    } catch (err) {
      console.error('Error saving diagram:', err);
      showError('Save failed', `Failed to save diagram: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  

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
      if (type === 'entity') {
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
    [reactFlowInstance]
  );

  // Handle new entity creation
  const handleCreateEntity = async (entityData) => {
    try {
      setLoading(true);
      
      // Create entity in backend
      const response = await entitiesAPI.create({
        diagramId: id,
        name: entityData.name,
        type: entityData.type,
        position: selectedNode.position,
        style: entityData.style || {}
      });
      
      const newEntity = response.data.data;
      
      // Add node to diagram
      const newNode = {
        id: newEntity._id,
        type: 'entity',
        position: newEntity.position,
        data: {
          name: newEntity.name,
          type: newEntity.type,
          attributes: [],
          style: newEntity.style
        }
      };
      
      setNodes(nds => [...nds, newNode]);
      
      // Reset selection
      setSelectedNode(newNode);
      setSidebarMode('entity');
      
      showSuccess('Entity created', 'New entity has been created successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(id);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
    } catch (err) {
      console.error('Error creating entity:', err);
      showError('Creation failed', 'Failed to create new entity');
    } finally {
      setLoading(false);
    }
  };

  // Update entity
  const handleUpdateEntity = async (entityData) => {
    try {
      setLoading(true);
      
      // Update entity in backend
      await entitiesAPI.update(selectedNode.id, {
        name: entityData.name,
        type: entityData.type,
        style: entityData.style
      });
      
      // Update node in diagram
      setNodes(nds =>
        nds.map(node => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                name: entityData.name,
                type: entityData.type,
                style: entityData.style
              }
            };
          }
          return node;
        })
      );
      
      showSuccess('Entity updated', 'Entity has been updated successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(id);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
    } catch (err) {
      console.error('Error updating entity:', err);
      showError('Update failed', 'Failed to update entity');
    } finally {
      setLoading(false);
    }
  };

  // Delete entity
  const handleDeleteEntity = async () => {
    if (!confirm('Are you sure you want to delete this entity? This will also delete all its attributes.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete entity from backend
      await entitiesAPI.delete(selectedNode.id);
      
      // Remove node and connected edges from diagram
      setNodes(nds => nds.filter(node => node.id !== selectedNode.id));
      setEdges(eds => eds.filter(edge => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      
      // Reset selection
      setSelectedNode(null);
      setSidebarMode('none');
      
      showSuccess('Entity deleted', 'Entity has been deleted successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(id);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
    } catch (err) {
      console.error('Error deleting entity:', err);
      showError('Delete failed', 'Failed to delete entity');
    } finally {
      setLoading(false);
    }
  };

  // Create relationship
  const handleCreateRelationship = async () => {
    setSidebarMode('new-relationship');
  };

  // Handle new relationship form submission
  const handleCreateRelationshipSubmit = async (relationshipData) => {
    try {
      setLoading(true);
      
      // Create relationship in backend
      const response = await relationshipsAPI.create({
        diagramId: id,
        name: relationshipData.name,
        type: relationshipData.type,
        entities: [
          {
            entityId: relationshipData.sourceId,
            role: relationshipData.sourceRole || '',
            cardinality: relationshipData.sourceCardinality,
            participation: relationshipData.sourceParticipation || 'partial'
          },
          {
            entityId: relationshipData.targetId,
            role: relationshipData.targetRole || '',
            cardinality: relationshipData.targetCardinality,
            participation: relationshipData.targetParticipation || 'partial'
          }
        ],
        position: {
          x: (relationshipData.sourcePosition.x + relationshipData.targetPosition.x) / 2,
          y: (relationshipData.sourcePosition.y + relationshipData.targetPosition.y) / 2
        },
        style: relationshipData.style || {}
      });
      
      const newRelationship = response.data.data;
      
      // Add edge to diagram
      const newEdge = {
        id: newRelationship._id,
        source: relationshipData.sourceId,
        target: relationshipData.targetId,
        type: 'relationship',
        data: {
          name: newRelationship.name,
          type: newRelationship.type,
          entities: newRelationship.entities,
          style: newRelationship.style
        }
      };
      
      setEdges(eds => [...eds, newEdge]);
      
      // Reset selection
      setSelectedEdge(newEdge);
      setSidebarMode('relationship');
      
      showSuccess('Relationship created', 'New relationship has been created successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(id);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
    } catch (err) {
      console.error('Error creating relationship:', err);
      showError('Creation failed', 'Failed to create new relationship');
    } finally {
      setLoading(false);
    }
  };

  // Update relationship
  const handleUpdateRelationship = async (relationshipData) => {
    try {
      setLoading(true);
      
      // Update relationship in backend
      await relationshipsAPI.update(selectedEdge.id, {
        name: relationshipData.name,
        type: relationshipData.type,
        entities: [
          {
            entityId: relationshipData.sourceId,
            role: relationshipData.sourceRole || '',
            cardinality: relationshipData.sourceCardinality,
            participation: relationshipData.sourceParticipation || 'partial'
          },
          {
            entityId: relationshipData.targetId,
            role: relationshipData.targetRole || '',
            cardinality: relationshipData.targetCardinality,
            participation: relationshipData.targetParticipation || 'partial'
          }
        ],
        style: relationshipData.style
      });
      
      // Update edge in diagram
      setEdges(eds =>
        eds.map(edge => {
          if (edge.id === selectedEdge.id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                name: relationshipData.name,
                type: relationshipData.type,
                style: relationshipData.style,
                entities: [
                  {
                    entityId: { _id: relationshipData.sourceId },
                    role: relationshipData.sourceRole || '',
                    cardinality: relationshipData.sourceCardinality,
                    participation: relationshipData.sourceParticipation || 'partial'
                  },
                  {
                    entityId: { _id: relationshipData.targetId },
                    role: relationshipData.targetRole || '',
                    cardinality: relationshipData.targetCardinality,
                    participation: relationshipData.targetParticipation || 'partial'
                  }
                ]
              }
            };
          }
          return edge;
        })
      );
      
      showSuccess('Relationship updated', 'Relationship has been updated successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(id);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
    } catch (err) {
      console.error('Error updating relationship:', err);
      showError('Update failed', 'Failed to update relationship');
    } finally {
      setLoading(false);
    }
  };

  // Delete relationship
  const handleDeleteRelationship = async () => {
    if (!confirm('Are you sure you want to delete this relationship?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete relationship from backend
      await relationshipsAPI.delete(selectedEdge.id);
      
      // Remove edge from diagram
      setEdges(eds => eds.filter(edge => edge.id !== selectedEdge.id));
      
      // Reset selection
      setSelectedEdge(null);
      setSidebarMode('none');
      
      showSuccess('Relationship deleted', 'Relationship has been deleted successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(id);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
    } catch (err) {
      console.error('Error deleting relationship:', err);
      showError('Delete failed', 'Failed to delete relationship');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding attribute to entity
  const handleAddAttribute = () => {
    setSidebarMode('new-attribute');
  };

  // Create attribute
  const handleCreateAttribute = async (attributeData) => {
    try {
      setLoading(true);
      
      // Create attribute in backend
      const response = await attributesAPI.create({
        entityId: selectedNode.id,
        ...attributeData
      });
      const newAttribute = response.data.data;
      
      // Update node data
      setNodes(nds =>
        nds.map(node => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                attributes: [...(node.data.attributes || []), newAttribute]
              }
            };
          }
          return node;
        })
      );
      
      // Update selected node
      setSelectedNode({
        ...selectedNode,
        data: {
          ...selectedNode.data,
          attributes: [...(selectedNode.data.attributes || []), newAttribute]
        }
      });
      
      // Change back to entity view
      setSidebarMode('entity');
      
      showSuccess('Attribute created', 'New attribute has been created successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(id);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
    } catch (err) {
      console.error('Error creating attribute:', err);
      showError('Creation failed', 'Failed to create new attribute');
    } finally {
      setLoading(false);
    }
  };

  // Update attribute
  const handleUpdateAttribute = async (attributeId, attributeData) => {
    try {
      setLoading(true);
      
      // Update attribute in backend
      const response = await attributesAPI.update(attributeId, attributeData);
      const updatedAttribute = response.data.data;
      
      // Update node data
      setNodes(nds =>
        nds.map(node => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                attributes: (node.data.attributes || []).map(attr =>
                  attr._id === attributeId ? updatedAttribute : attr
                )
              }
            };
          }
          return node;
        })
      );
      
      // Update selected node
      setSelectedNode({
        ...selectedNode,
        data: {
          ...selectedNode.data,
          attributes: (selectedNode.data.attributes || []).map(attr =>
            attr._id === attributeId ? updatedAttribute : attr
          )
        }
      });
      
      showSuccess('Attribute updated', 'Attribute has been updated successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(id);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
    } catch (err) {
      console.error('Error updating attribute:', err);
      showError('Update failed', 'Failed to update attribute');
    } finally {
      setLoading(false);
    }
  };

  // Delete attribute
  const handleDeleteAttribute = async (attributeId) => {
    if (!confirm('Are you sure you want to delete this attribute?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete attribute from backend
      await attributesAPI.delete(attributeId);
      
      // Update node data
      setNodes(nds =>
        nds.map(node => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                attributes: (node.data.attributes || []).filter(attr => attr._id !== attributeId)
              }
            };
          }
          return node;
        })
      );
      
      // Update selected node
      setSelectedNode({
        ...selectedNode,
        data: {
          ...selectedNode.data,
          attributes: (selectedNode.data.attributes || []).filter(attr => attr._id !== attributeId)
        }
      });
      
      showSuccess('Attribute deleted', 'Attribute has been deleted successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(id);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
    } catch (err) {
      console.error('Error deleting attribute:', err);
      showError('Delete failed', 'Failed to delete attribute');
    } finally {
      setLoading(false);
    }
  };

  // Update diagram settings
  const handleUpdateDiagramSettings = async (settingsData) => {
    try {
      setLoading(true);
      
      // Update diagram in backend
      await diagramsAPI.update(id, settingsData);
      
      // Update local diagram data
      setDiagram({
        ...diagram,
        ...settingsData
      });
      
      showSuccess('Diagram updated', 'Diagram settings have been updated successfully');
      
    } catch (err) {
      console.error('Error updating diagram settings:', err);
      showError('Update failed', 'Failed to update diagram settings');
    } finally {
      setLoading(false);
    }
  };

  // Update MongoDB schema
  const handleUpdateSchema = async (schemaCode) => {
    try {
      setLoading(true);
      
      // Update diagram schema in backend
      await diagramsAPI.updateFromSchema(id, schemaCode);
      
      // Refetch diagram to get updated entities and relationships
      const response = await diagramsAPI.getById(id);
      const diagramData = response.data.data;
      
      // Initialize nodes and edges
      const diagramNodes = [];
      const diagramEdges = [];
      
      // Process entities (nodes)
      if (diagramData.entities && diagramData.entities.length > 0) {
        diagramData.entities.forEach(entity => {
          diagramNodes.push({
            id: entity._id,
            type: 'entity',
            position: entity.position,
            data: {
              name: entity.name,
              type: entity.type,
              attributes: entity.attributes,
              style: entity.style
            }
          });
        });
      }
      
      // Process relationships (edges)
      if (diagramData.relationships && diagramData.relationships.length > 0) {
        diagramData.relationships.forEach(relationship => {
          if (relationship.entities.length >= 2) {
            // Create an edge between the first two entities
            const sourceId = relationship.entities[0].entityId._id;
            const targetId = relationship.entities[1].entityId._id;
            
            diagramEdges.push({
              id: relationship._id,
              source: sourceId,
              target: targetId,
              type: 'relationship',
              data: {
                name: relationship.name,
                type: relationship.type,
                entities: relationship.entities,
                style: relationship.style
              }
            });
          }
        });
      }
      
      setNodes(diagramNodes);
      setEdges(diagramEdges);
      setMongoDBSchema(schemaCode);
      
      showSuccess('Schema updated', 'Schema has been updated and diagram has been regenerated');
      
    } catch (err) {
      console.error('Error updating schema:', err);
      showError('Update failed', 'Failed to update schema');
    } finally {
      setLoading(false);
    }
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
      reactFlowInstance.toImage({ download: true, fileName: `${diagram.name}.png` });
      
      // Remove the temporary background
      setTimeout(() => {
        flowElement.removeChild(exportBackground);
      }, 500);
    }
  };

  // Drag start handler for toolbar items
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  if (loading && !diagram) {
    return <PageLoading />;
  }

  if (error && !diagram) {
    return (
      <div className="p-6">
        <ErrorMessage 
          title="Error loading diagram" 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/projects/${project?._id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <div>
            <h1 className="text-lg font-semibold">{diagram?.name}</h1>
            <p className="text-xs text-muted-foreground">{project?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSidebarMode('settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          
          <Button 
            size="sm" 
            onClick={saveDiagram}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Main diagram area */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b">
            <TabsList>
              <TabsTrigger value="diagram">
                <Edit className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="h-4 w-4 mr-2" />
                MongoDB Schema
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="diagram" className="flex-1 relative">
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
          
          <TabsContent value="preview" className="flex-1 relative">
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
          
          <TabsContent value="code" className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
            <CodeViewer 
              code={mongoDBSchema} 
              onChange={handleUpdateSchema}
            />
          </TabsContent>
        </Tabs>
        
        {/* Side panel */}
        {sidebarOpen && (
          <div className="w-80 border-l bg-white dark:bg-gray-900 overflow-y-auto relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            
            {sidebarMode === 'none' && (
              <div className="p-4 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                <p>Select an element on the diagram to edit its properties</p>
              </div>
            )}
            
            {sidebarMode === 'entity' && selectedNode && (
              <EntityForm
                entity={selectedNode}
                onUpdate={handleUpdateEntity}
                onDelete={handleDeleteEntity}
                onAddAttribute={handleAddAttribute}
                onUpdateAttribute={handleUpdateAttribute}
                onDeleteAttribute={handleDeleteAttribute}
              />
            )}
            
            {sidebarMode === 'new-entity' && selectedNode && (
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Create New Entity</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="entityName">Entity Name</Label>
                    <Input
                      id="entityName"
                      placeholder="Enter entity name"
                      value={selectedNode.data?.name || ''}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        data: { ...selectedNode.data, name: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="entityType">Entity Type</Label>
                    <select
                      id="entityType"
                      className="w-full p-2 border rounded bg-background"
                      value={selectedNode.data?.type || 'regular'}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        data: { ...selectedNode.data, type: e.target.value }
                      })}
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
                    <Button
                      onClick={() => handleCreateEntity({
                        name: selectedNode.data?.name || 'New Entity',
                        type: selectedNode.data?.type || 'regular'
                      })}
                    >
                      Create Entity
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {sidebarMode === 'new-attribute' && selectedNode && (
              <AttributeForm
                entityId={selectedNode.id}
                onSave={handleCreateAttribute}
                onCancel={() => setSidebarMode('entity')}
              />
            )}
            
            {sidebarMode === 'relationship' && selectedEdge && (
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Relationship</h2>
                {/* Relationship editing form would go here */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="relationshipName">Name</Label>
                    <Input
                      id="relationshipName"
                      placeholder="Relationship name"
                      value={selectedEdge.data?.name || ''}
                      onChange={(e) => setSelectedEdge({
                        ...selectedEdge,
                        data: { ...selectedEdge.data, name: e.target.value }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relationshipType">Type</Label>
                    <select
                      id="relationshipType"
                      className="w-full p-2 border rounded bg-background"
                      value={selectedEdge.data?.type || 'one-to-many'}
                      onChange={(e) => setSelectedEdge({
                        ...selectedEdge,
                        data: { ...selectedEdge.data, type: e.target.value }
                      })}
                    >
                      <option value="one-to-one">One-to-One</option>
                      <option value="one-to-many">One-to-Many</option>
                      <option value="many-to-many">Many-to-Many</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 space-x-2 flex justify-end">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteRelationship}
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => handleUpdateRelationship({
                        name: selectedEdge.data?.name || 'Relationship',
                        type: selectedEdge.data?.type || 'one-to-many',
                        sourceId: selectedEdge.source,
                        targetId: selectedEdge.target,
                        // Include other properties as needed
                      })}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {sidebarMode === 'new-relationship' && (
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Create Relationship</h2>
                {/* New relationship form would go here */}
                <div className="space-y-4">
                  {/* Content would depend on the relationship creation flow */}
                </div>
              </div>
            )}
            
            {sidebarMode === 'settings' && (
              <DiagramSettings
                diagram={diagram}
                onUpdate={handleUpdateDiagramSettings}
                onBack={() => setSidebarMode('none')}
              />
            )}
          </div>
        )}
        
        {!sidebarOpen && (
          <Button
            variant="ghost"
            className="absolute right-4 top-20 p-1 h-8 w-8"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DiagramEditor;
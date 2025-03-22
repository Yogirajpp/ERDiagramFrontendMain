import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import { diagramsAPI, projectsAPI, entitiesAPI, relationshipsAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

// Create the context
const DiagramContext = createContext();

// Context provider component
export const DiagramProvider = ({ children, diagramId }) => {
  const { showSuccess, showError } = useToast();
  
  // Diagram state
  const [diagram, setDiagram] = useState(null);
  const [project, setProject] = useState(null);
  const [mongoDBSchema, setMongoDBSchema] = useState('');
  
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [sidebarMode, setSidebarMode] = useState('none');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('diagram');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // Update fullscreen state when fullscreen is toggled via browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Load diagram data
  useEffect(() => {
    if (!diagramId) return;
    
    const fetchDiagram = async () => {
      try {
        setLoading(true);
        const response = await diagramsAPI.getById(diagramId);
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
          const schemaResponse = await diagramsAPI.generateSchema(diagramId);
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
  }, [diagramId]);

  // Save diagram data
  const saveDiagram = async () => {
    try {
      setLoading(true);
      
      // Update entity positions
      const entityUpdatePromises = nodes.map(node => {
        if (node.type === 'entity') {
          return entitiesAPI.update(node.id, {
            position: node.position
          });
        }
        return Promise.resolve();
      });
      
      // Wait for all entity position updates to complete
      await Promise.all(entityUpdatePromises);
      
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
      
      // Update diagram layout
      await diagramsAPI.update(diagramId, layoutData);
      
      // Refresh MongoDB schema after saving
      if (nodes.length > 0) {
        try {
          const schemaResponse = await diagramsAPI.generateSchema(diagramId);
          if (schemaResponse.data && schemaResponse.data.data) {
            setMongoDBSchema(schemaResponse.data.data.schemaCode);
          }
        } catch (schemaErr) {
          console.warn('Non-critical error updating schema:', schemaErr);
          // We don't want to fail the whole save operation if schema generation fails
        }
      }
      
      showSuccess('Diagram saved', 'All changes have been saved successfully');
    } catch (err) {
      console.error('Error saving diagram:', err);
      showError('Save failed', `Failed to save diagram: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const contextValue = {
    // Diagram data
    diagram,
    setDiagram,
    project,
    mongoDBSchema, 
    setMongoDBSchema,
    
    // ReactFlow state
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    reactFlowInstance,
    setReactFlowInstance,
    
    // UI state
    loading, 
    setLoading,
    error, 
    setError,
    selectedNode, 
    setSelectedNode,
    selectedEdge, 
    setSelectedEdge,
    sidebarMode, 
    setSidebarMode,
    sidebarOpen, 
    setSidebarOpen,
    activeTab, 
    setActiveTab,
    isFullscreen,
    setIsFullscreen,
    toggleFullscreen,
    
    // Actions
    saveDiagram,
    
    // Diagram ID
    diagramId
  };

  return (
    <DiagramContext.Provider value={contextValue}>
      {children}
    </DiagramContext.Provider>
  );
};

// Custom hook for using the context
export const useDiagram = () => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }
  return context;
};

export default DiagramContext;
import { useState } from 'react';
import { entitiesAPI, diagramsAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useDiagram } from '@/contexts/DiagramContext';

/**
 * Custom hook for entity operations
 */
export const useEntities = () => {
  const { 
    diagramId, 
    nodes, 
    setNodes, 
    setSelectedNode, 
    setSidebarMode, 
    setMongoDBSchema,
    setLoading
  } = useDiagram();
  
  const { showSuccess, showError } = useToast();
  
  /**
   * Create a new entity
   */
  const createEntity = async (entityData, position) => {
    try {
      setLoading(true);
      
      // Create entity in backend
      const response = await entitiesAPI.create({
        diagramId,
        name: entityData.name,
        type: entityData.type,
        position,
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
      const schemaResponse = await diagramsAPI.generateSchema(diagramId);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
      return newNode;
    } catch (err) {
      console.error('Error creating entity:', err);
      showError('Creation failed', 'Failed to create new entity');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Update an existing entity
   */
  const updateEntity = async (entityId, entityData) => {
    try {
      setLoading(true);
      
      // Update entity in backend
      await entitiesAPI.update(entityId, {
        name: entityData.name,
        type: entityData.type,
        style: entityData.style
      });
      
      // Update node in diagram
      setNodes(nds =>
        nds.map(node => {
          if (node.id === entityId) {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                name: entityData.name,
                type: entityData.type,
                style: entityData.style
              }
            };
            
            // Also update selected node if this is the currently selected one
            setSelectedNode(current => current?.id === entityId ? updatedNode : current);
            
            return updatedNode;
          }
          return node;
        })
      );
      
      showSuccess('Entity updated', 'Entity has been updated successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(diagramId);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
      return true;
    } catch (err) {
      console.error('Error updating entity:', err);
      showError('Update failed', 'Failed to update entity');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Delete an entity
   */
  const deleteEntity = async (entityId) => {
    if (!confirm('Are you sure you want to delete this entity? This will also delete all its attributes.')) {
      return false;
    }
    
    try {
      setLoading(true);
      
      // Delete entity from backend
      await entitiesAPI.delete(entityId);
      
      // Remove node from diagram
      setNodes(nds => nds.filter(node => node.id !== entityId));
      
      // Reset selection
      setSelectedNode(null);
      setSidebarMode('none');
      
      showSuccess('Entity deleted', 'Entity has been deleted successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(diagramId);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
      return true;
    } catch (err) {
      console.error('Error deleting entity:', err);
      showError('Delete failed', 'Failed to delete entity');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createEntity,
    updateEntity,
    deleteEntity
  };
};

export default useEntities;
import { useState } from 'react';
import { attributesAPI, diagramsAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useDiagram } from '@/contexts/DiagramContext';

/**
 * Custom hook for attribute operations
 */
export const useAttributes = () => {
  const { 
    diagramId, 
    nodes, 
    setNodes, 
    selectedNode, 
    setSelectedNode, 
    setSidebarMode, 
    setMongoDBSchema,
    setLoading
  } = useDiagram();
  
  const { showSuccess, showError } = useToast();
  
  /**
   * Create a new attribute for an entity
   */
  const createAttribute = async (entityId, attributeData) => {
    try {
      setLoading(true);
      
      // Create attribute in backend
      const response = await attributesAPI.create({
        entityId,
        ...attributeData
      });
      
      const newAttribute = response.data.data;
      
      // Update node data
      setNodes(nds =>
        nds.map(node => {
          if (node.id === entityId) {
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
      
      // Update selected node if this is the currently selected entity
      if (selectedNode && selectedNode.id === entityId) {
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            attributes: [...(selectedNode.data.attributes || []), newAttribute]
          }
        });
      }
      
      // Change back to entity view
      setSidebarMode('entity');
      
      showSuccess('Attribute created', 'New attribute has been created successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(diagramId);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
      return newAttribute;
    } catch (err) {
      console.error('Error creating attribute:', err);
      showError('Creation failed', 'Failed to create new attribute');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Update an existing attribute
   */
  const updateAttribute = async (entityId, attributeId, attributeData) => {
    try {
      setLoading(true);
      
      // Update attribute in backend
      const response = await attributesAPI.update(attributeId, attributeData);
      const updatedAttribute = response.data.data;
      
      // Update node data
      setNodes(nds =>
        nds.map(node => {
          if (node.id === entityId) {
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
      
      // Update selected node if this is the currently selected entity
      if (selectedNode && selectedNode.id === entityId) {
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            attributes: (selectedNode.data.attributes || []).map(attr =>
              attr._id === attributeId ? updatedAttribute : attr
            )
          }
        });
      }
      
      showSuccess('Attribute updated', 'Attribute has been updated successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(diagramId);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
      return updatedAttribute;
    } catch (err) {
      console.error('Error updating attribute:', err);
      showError('Update failed', 'Failed to update attribute');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Delete an attribute
   */
  const deleteAttribute = async (entityId, attributeId) => {
    
    try {
      setLoading(true);
      
      // Delete attribute from backend
      await attributesAPI.delete(attributeId);
      
      // Update node data
      setNodes(nds =>
        nds.map(node => {
          if (node.id === entityId) {
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
      
      // Update selected node if this is the currently selected entity
      if (selectedNode && selectedNode.id === entityId) {
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            attributes: (selectedNode.data.attributes || []).filter(attr => attr._id !== attributeId)
          }
        });
      }
      
      showSuccess('Attribute deleted', 'Attribute has been deleted successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(diagramId);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
      return true;
    } catch (err) {
      console.error('Error deleting attribute:', err);
      showError('Delete failed', 'Failed to delete attribute');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createAttribute,
    updateAttribute,
    deleteAttribute
  };
};

export default useAttributes;
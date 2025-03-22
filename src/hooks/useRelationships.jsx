import { useState } from 'react';
import { relationshipsAPI, diagramsAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useDiagram } from '@/contexts/DiagramContext';

/**
 * Custom hook for relationship operations
 */
export const useRelationships = () => {
  const { 
    diagramId, 
    nodes,
    edges, 
    setEdges, 
    setSelectedEdge, 
    setSidebarMode, 
    setMongoDBSchema,
    setLoading
  } = useDiagram();
  
  const { showSuccess, showError } = useToast();
  
  /**
   * Create a new relationship
   */
  const createRelationship = async (relationshipData) => {
    try {
      setLoading(true);
      
      // Find source and target node positions
      const sourceNode = nodes.find(n => n.id === relationshipData.sourceId);
      const targetNode = nodes.find(n => n.id === relationshipData.targetId);
      
      if (!sourceNode || !targetNode) {
        throw new Error('Source or target entity not found');
      }
      
      // Calculate midpoint position for the relationship
      const position = {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2
      };
      
      // Create relationship in backend
      const response = await relationshipsAPI.create({
        diagramId,
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
        position,
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
      const schemaResponse = await diagramsAPI.generateSchema(diagramId);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
      return newRelationship;
    } catch (err) {
      console.error('Error creating relationship:', err);
      showError('Creation failed', 'Failed to create new relationship');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Update an existing relationship
   */
  const updateRelationship = async (relationshipId, relationshipData) => {
    try {
      setLoading(true);
      
      // Update relationship in backend
      await relationshipsAPI.update(relationshipId, {
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
          if (edge.id === relationshipId) {
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
      
      // Reset selection
      setSidebarMode('none');
      setSelectedEdge(null);
      
      showSuccess('Relationship updated', 'Relationship has been updated successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(diagramId);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
      return true;
    } catch (err) {
      console.error('Error updating relationship:', err);
      showError('Update failed', 'Failed to update relationship');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Delete a relationship
   */
  const deleteRelationship = async (relationshipId) => {
    if (!confirm('Are you sure you want to delete this relationship?')) {
      return false;
    }
    
    try {
      setLoading(true);
      
      // Delete relationship from backend
      await relationshipsAPI.delete(relationshipId);
      
      // Remove edge from diagram
      setEdges(eds => eds.filter(edge => edge.id !== relationshipId));
      
      // Reset selection
      setSelectedEdge(null);
      setSidebarMode('none');
      
      showSuccess('Relationship deleted', 'Relationship has been deleted successfully');
      
      // Generate schema
      const schemaResponse = await diagramsAPI.generateSchema(diagramId);
      setMongoDBSchema(schemaResponse.data.data.schemaCode);
      
      return true;
    } catch (err) {
      console.error('Error deleting relationship:', err);
      showError('Delete failed', 'Failed to delete relationship');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createRelationship,
    updateRelationship,
    deleteRelationship
  };
};

export default useRelationships;
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { entitiesAPI } from '@/lib/api';

const RelationshipForm = ({ 
  relationship = null, 
  diagramId, 
  nodes = [], 
  onSave, 
  onCancel 
}) => {
  const [entities, setEntities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'one-to-many',
    sourceId: '',
    sourceRole: '',
    sourceCardinality: '1',
    sourceParticipation: 'partial',
    targetId: '',
    targetRole: '',
    targetCardinality: 'n',
    targetParticipation: 'partial',
    style: {
      lineColor: '#000000',
      lineStyle: 'solid',
      lineWidth: 1,
      textColor: '#000000'
    }
  });
  const [sourcePos, setSourcePos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  // Load entities if not provided in nodes
  useEffect(() => {
    const fetchEntities = async () => {
      if (nodes.length === 0 && diagramId) {
        try {
          const response = await entitiesAPI.getByDiagram(diagramId);
          setEntities(response.data.data);
        } catch (err) {
          console.error('Error loading entities:', err);
        }
      } else {
        setEntities(nodes.map(node => ({
          _id: node.id,
          name: node.data.name,
          position: node.position
        })));
      }
    };

    fetchEntities();
  }, [diagramId, nodes]);

  // Load existing relationship data if editing
  useEffect(() => {
    if (relationship) {
      // For editing an existing relationship
      if (relationship.data && relationship.data.entities) {
        const sourceEntity = relationship.data.entities[0] || {};
        const targetEntity = relationship.data.entities[1] || {};
        
        setFormData({
          name: relationship.data.name || '',
          type: relationship.data.type || 'one-to-many',
          sourceId: relationship.source || sourceEntity.entityId?._id || '',
          sourceRole: sourceEntity.role || '',
          sourceCardinality: sourceEntity.cardinality || '1',
          sourceParticipation: sourceEntity.participation || 'partial',
          targetId: relationship.target || targetEntity.entityId?._id || '',
          targetRole: targetEntity.role || '',
          targetCardinality: targetEntity.cardinality || 'n',
          targetParticipation: targetEntity.participation || 'partial',
          style: relationship.data.style || {
            lineColor: '#000000',
            lineStyle: 'solid',
            lineWidth: 1,
            textColor: '#000000'
          }
        });
      }
    } else if (entities.length >= 2) {
      // Set default entities for new relationship
      setFormData(prev => ({
        ...prev,
        sourceId: entities[0]?._id || '',
        targetId: entities[1]?._id || ''
      }));
    }
  }, [relationship, entities]);

  // Update positions when source/target entities change
  useEffect(() => {
    const sourceEntity = entities.find(e => e._id === formData.sourceId);
    const targetEntity = entities.find(e => e._id === formData.targetId);
    
    if (sourceEntity && sourceEntity.position) {
      setSourcePos(sourceEntity.position);
    }
    
    if (targetEntity && targetEntity.position) {
      setTargetPos(targetEntity.position);
    }
  }, [formData.sourceId, formData.targetId, entities]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('style.')) {
      const styleProp = name.split('.')[1];
      setFormData({
        ...formData,
        style: {
          ...formData.style,
          [styleProp]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSave({
      ...formData,
      sourcePosition: sourcePos,
      targetPosition: targetPos
    });
  };

  // Set cardinality automatically based on relationship type
  const handleTypeChange = (e) => {
    const type = e.target.value;
    
    let sourceCardinality = '1';
    let targetCardinality = 'n';
    
    if (type === 'one-to-one') {
      sourceCardinality = '1';
      targetCardinality = '1';
    } else if (type === 'one-to-many') {
      sourceCardinality = '1';
      targetCardinality = 'n';
    } else if (type === 'many-to-many') {
      sourceCardinality = 'n';
      targetCardinality = 'n';
    }
    
    setFormData({
      ...formData,
      type,
      sourceCardinality,
      targetCardinality
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {relationship ? 'Edit Relationship' : 'Create Relationship'}
        </h2>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Relationship Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., has, belongs to"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Relationship Type</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
            className="w-full p-2 border rounded bg-background"
          >
            <option value="one-to-one">One-to-One</option>
            <option value="one-to-many">One-to-Many</option>
            <option value="many-to-many">Many-to-Many</option>
          </select>
        </div>
      </div>

      <Separator />

      {/* Source Entity */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Source Entity</h3>
        
        <div className="space-y-2">
          <Label htmlFor="sourceId">Entity</Label>
          <select
            id="sourceId"
            name="sourceId"
            value={formData.sourceId}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-background"
            required
          >
            <option value="">Select source entity</option>
            {entities.map(entity => (
              <option key={entity._id} value={entity._id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceRole">Role (Optional)</Label>
          <Input
            id="sourceRole"
            name="sourceRole"
            value={formData.sourceRole}
            onChange={handleChange}
            placeholder="e.g., owner, parent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceCardinality">Cardinality</Label>
          <select
            id="sourceCardinality"
            name="sourceCardinality"
            value={formData.sourceCardinality}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-background"
          >
            <option value="0..1">Zero or One (0..1)</option>
            <option value="1">Exactly One (1)</option>
            <option value="0..n">Zero or Many (0..*)</option>
            <option value="1..n">One or Many (1..*)</option>
            <option value="n">Many (*)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceParticipation">Participation</Label>
          <select
            id="sourceParticipation"
            name="sourceParticipation"
            value={formData.sourceParticipation}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-background"
          >
            <option value="partial">Partial</option>
            <option value="total">Total</option>
          </select>
        </div>
      </div>

      <Separator />

      {/* Target Entity */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Target Entity</h3>
        
        <div className="space-y-2">
          <Label htmlFor="targetId">Entity</Label>
          <select
            id="targetId"
            name="targetId"
            value={formData.targetId}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-background"
            required
          >
            <option value="">Select target entity</option>
            {entities
              .filter(entity => entity._id !== formData.sourceId)
              .map(entity => (
                <option key={entity._id} value={entity._id}>
                  {entity.name}
                </option>
              ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetRole">Role (Optional)</Label>
          <Input
            id="targetRole"
            name="targetRole"
            value={formData.targetRole}
            onChange={handleChange}
            placeholder="e.g., member, child"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetCardinality">Cardinality</Label>
          <select
            id="targetCardinality"
            name="targetCardinality"
            value={formData.targetCardinality}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-background"
          >
            <option value="0..1">Zero or One (0..1)</option>
            <option value="1">Exactly One (1)</option>
            <option value="0..n">Zero or Many (0..*)</option>
            <option value="1..n">One or Many (1..*)</option>
            <option value="n">Many (*)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetParticipation">Participation</Label>
          <select
            id="targetParticipation"
            name="targetParticipation"
            value={formData.targetParticipation}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-background"
          >
            <option value="partial">Partial</option>
            <option value="total">Total</option>
          </select>
        </div>
      </div>

      <Separator />

      {/* Style Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Style Options</h3>
        
        <div className="space-y-2">
          <Label htmlFor="style.lineStyle">Line Style</Label>
          <select
            id="style.lineStyle"
            name="style.lineStyle"
            value={formData.style.lineStyle}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-background"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style.lineWidth">Line Width</Label>
          <select
            id="style.lineWidth"
            name="style.lineWidth"
            value={formData.style.lineWidth}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-background"
          >
            <option value="1">Thin</option>
            <option value="2">Medium</option>
            <option value="3">Thick</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style.lineColor">Line Color</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              id="style.lineColor"
              name="style.lineColor"
              value={formData.style.lineColor}
              onChange={handleChange}
              className="w-12 h-8 p-1"
            />
            <Input
              type="text"
              value={formData.style.lineColor}
              onChange={handleChange}
              name="style.lineColor"
              className="flex-1"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-4 flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {relationship ? 'Update' : 'Create'} Relationship
        </Button>
      </div>
    </form>
  );
};

export default RelationshipForm;
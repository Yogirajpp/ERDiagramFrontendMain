import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trash2, Save } from 'lucide-react';

const RelationshipForm = ({
  relationship = null,  // If provided, we're editing an existing relationship
  availableEntities = [], // All entities in the diagram
  onSave,             // Save callback
  onCancel,           // Cancel callback
  onDelete            // Delete callback
}) => {
  // Initialize form data based on provided relationship
  const [formData, setFormData] = useState({
    name: relationship?.data?.name || '',
    type: relationship?.data?.type || 'one-to-many',
    sourceId: relationship?.source || '',
    targetId: relationship?.target || '',
    sourceRole: (relationship?.data?.entities?.[0]?.role) || '',
    targetRole: (relationship?.data?.entities?.[1]?.role) || '',
    sourceCardinality: (relationship?.data?.entities?.[0]?.cardinality) || '1',
    targetCardinality: (relationship?.data?.entities?.[1]?.cardinality) || 'n',
    sourceParticipation: (relationship?.data?.entities?.[0]?.participation) || 'partial',
    targetParticipation: (relationship?.data?.entities?.[1]?.participation) || 'partial',
    style: relationship?.data?.style || {
      lineColor: '#000000',
      lineStyle: 'solid',
      lineWidth: 1
    }
  });

  // Auto-select the source and target if not editing
  useEffect(() => {
    if (!relationship && availableEntities.length >= 2) {
      setFormData(prev => ({
        ...prev,
        sourceId: availableEntities[0]?.id,
        targetId: availableEntities[1]?.id
      }));
    }
  }, [relationship, availableEntities]);

  // Find source and target positions for new relationships
  const getEntityPositions = () => {
    const sourceEntity = availableEntities.find(e => e.id === formData.sourceId);
    const targetEntity = availableEntities.find(e => e.id === formData.targetId);
    
    return {
      sourcePosition: sourceEntity?.position || { x: 0, y: 0 },
      targetPosition: targetEntity?.position || { x: 100, y: 100 }
    };
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle style change
  const handleStyleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [name]: value
      }
    }));
  };

  // Update relationship type based on cardinality
  useEffect(() => {
    const { sourceCardinality, targetCardinality } = formData;
    
    let newType = 'one-to-many'; // Default
    
    if ((sourceCardinality === '1' || sourceCardinality === '0..1') && 
        (targetCardinality === '1' || targetCardinality === '0..1')) {
      newType = 'one-to-one';
    } else if ((sourceCardinality === 'n' || sourceCardinality === '0..n' || sourceCardinality === '1..n') && 
               (targetCardinality === 'n' || targetCardinality === '0..n' || targetCardinality === '1..n')) {
      newType = 'many-to-many';
    }
    
    if (newType !== formData.type) {
      setFormData(prev => ({
        ...prev,
        type: newType
      }));
    }
  }, [formData.sourceCardinality, formData.targetCardinality]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      alert('Relationship name is required');
      return;
    }
    
    if (!formData.sourceId || !formData.targetId) {
      alert('Both source and target entities are required');
      return;
    }
    
    // Get entity positions for new relationships
    const positions = getEntityPositions();
    
    // If editing existing relationship
    if (relationship) {
      onSave({
        ...formData,
        sourcePosition: positions.sourcePosition,
        targetPosition: positions.targetPosition
      });
    } else {
      // Creating new relationship
      onSave({
        ...formData,
        sourcePosition: positions.sourcePosition,
        targetPosition: positions.targetPosition
      });
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-semibold mt-2">
          {relationship ? 'Edit Relationship' : 'Create Relationship'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {relationship ? 'Modify relationship properties' : 'Define a new relationship between entities'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="name">Relationship Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. has, belongs_to, contains"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Relationship Type</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-background"
            disabled // Type is determined automatically by cardinality
          >
            <option value="one-to-one">One-to-One</option>
            <option value="one-to-many">One-to-Many</option>
            <option value="many-to-many">Many-to-Many</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Type is determined by cardinality settings
          </p>
        </div>
        
        <Separator />
        
        {/* Source Entity */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Source Entity</h3>
          
          <div className="space-y-2">
            <Label htmlFor="sourceId">Entity <span className="text-red-500">*</span></Label>
            <select
              id="sourceId"
              name="sourceId"
              value={formData.sourceId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              <option value="">Select Source Entity</option>
              {availableEntities.map(entity => (
                <option key={`source-${entity.id}`} value={entity.id}>
                  {entity.data?.name || 'Unnamed Entity'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceCardinality">Cardinality</Label>
              <select
                id="sourceCardinality"
                name="sourceCardinality"
                value={formData.sourceCardinality}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="0..1">Zero or One (0..1)</option>
                <option value="1">Exactly One (1)</option>
                <option value="0..n">Zero or Many (0..n)</option>
                <option value="1..n">One or Many (1..n)</option>
                <option value="n">Many (n)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sourceParticipation">Participation</Label>
              <select
                id="sourceParticipation"
                name="sourceParticipation"
                value={formData.sourceParticipation}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="partial">Partial</option>
                <option value="total">Total</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sourceRole">Role (Optional)</Label>
            <Input
              id="sourceRole"
              name="sourceRole"
              value={formData.sourceRole}
              onChange={handleChange}
              placeholder="e.g. parent, owner"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Target Entity */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Target Entity</h3>
          
          <div className="space-y-2">
            <Label htmlFor="targetId">Entity <span className="text-red-500">*</span></Label>
            <select
              id="targetId"
              name="targetId"
              value={formData.targetId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              <option value="">Select Target Entity</option>
              {availableEntities.map(entity => (
                <option key={`target-${entity.id}`} value={entity.id}>
                  {entity.data?.name || 'Unnamed Entity'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetCardinality">Cardinality</Label>
              <select
                id="targetCardinality"
                name="targetCardinality"
                value={formData.targetCardinality}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="0..1">Zero or One (0..1)</option>
                <option value="1">Exactly One (1)</option>
                <option value="0..n">Zero or Many (0..n)</option>
                <option value="1..n">One or Many (1..n)</option>
                <option value="n">Many (n)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetParticipation">Participation</Label>
              <select
                id="targetParticipation"
                name="targetParticipation"
                value={formData.targetParticipation}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="partial">Partial</option>
                <option value="total">Total</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetRole">Role (Optional)</Label>
            <Input
              id="targetRole"
              name="targetRole"
              value={formData.targetRole}
              onChange={handleChange}
              placeholder="e.g. child, member"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Style */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Line Style</h3>
          
          <div className="space-y-2">
            <Label htmlFor="lineColor">Line Color</Label>
            <div className="flex space-x-2">
              <Input
                type="color"
                id="lineColor"
                name="lineColor"
                value={formData.style.lineColor || '#000000'}
                onChange={handleStyleChange}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.style.lineColor || '#000000'}
                onChange={handleStyleChange}
                name="lineColor"
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lineStyle">Line Style</Label>
            <select
              id="lineStyle"
              name="lineStyle"
              value={formData.style.lineStyle || 'solid'}
              onChange={handleStyleChange}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lineWidth">Line Width</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="range"
                min="1"
                max="5"
                id="lineWidth"
                name="lineWidth"
                value={formData.style.lineWidth || 1}
                onChange={handleStyleChange}
                className="flex-1"
              />
              <span className="w-8 text-center">
                {formData.style.lineWidth || 1}px
              </span>
            </div>
          </div>
        </div>
        
        <div className="pt-6 flex justify-between mt-auto">
          {relationship && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex ml-auto">
            <Button type="button" variant="outline" onClick={onCancel} className="mr-2">
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {relationship ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RelationshipForm;
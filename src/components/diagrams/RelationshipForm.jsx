import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const RelationshipForm = ({ 
  relationship = null, 
  diagramId, 
  nodes = [], 
  onSave, 
  onDelete,
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'one-to-many',
    sourceId: '',
    targetId: '',
    sourceCardinality: '1',
    targetCardinality: 'n',
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION'
  });

  // Load existing relationship data if editing
  useEffect(() => {
    if (relationship) {
      // For editing an existing relationship
      if (relationship.data) {
        setFormData({
          name: relationship.data.name || '',
          type: relationship.data.type || 'one-to-many',
          sourceId: relationship.source || '',
          targetId: relationship.target || '',
          sourceCardinality: relationship.data.sourceCardinality || '1',
          targetCardinality: relationship.data.targetCardinality || 'n',
          onDelete: relationship.data.onDelete || 'NO ACTION',
          onUpdate: relationship.data.onUpdate || 'NO ACTION'
        });
      }
    } else if (nodes.length >= 2) {
      // Set default entities for new relationship
      setFormData(prev => ({
        ...prev,
        sourceId: nodes[0]?._id || nodes[0]?.id || '',
        targetId: nodes[1]?._id || nodes[1]?.id || ''
      }));
    }
  }, [relationship, nodes]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.sourceId || !formData.targetId) {
      alert('Please fill in all required fields');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="mr-2 h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-medium">
            {relationship ? 'Edit Relationship' : 'Create Relationship'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
        {/* Relationship Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Relationship Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., has, belongs_to, references"
            required
            autoFocus
          />
        </div>
        
        {/* Relationship Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Relationship Type</Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className={`p-2 border rounded ${formData.type === 'one-to-one' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-slate-800'}`}
              onClick={() => handleTypeChange({ target: { value: 'one-to-one' } })}
            >
              <div className="text-center">
                <span className="font-medium">One-to-One</span>
                <div className="text-xs text-muted-foreground mt-1">1:1</div>
              </div>
            </button>
            
            <button
              type="button"
              className={`p-2 border rounded ${formData.type === 'one-to-many' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-slate-800'}`}
              onClick={() => handleTypeChange({ target: { value: 'one-to-many' } })}
            >
              <div className="text-center">
                <span className="font-medium">One-to-Many</span>
                <div className="text-xs text-muted-foreground mt-1">1:N</div>
              </div>
            </button>
            
            <button
              type="button"
              className={`p-2 border rounded ${formData.type === 'many-to-many' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-slate-800'}`}
              onClick={() => handleTypeChange({ target: { value: 'many-to-many' } })}
            >
              <div className="text-center">
                <span className="font-medium">Many-to-Many</span>
                <div className="text-xs text-muted-foreground mt-1">N:N</div>
              </div>
            </button>
          </div>
        </div>
        
        <Separator />
        
        {/* Source and Target Entities */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sourceId">Source Table <span className="text-red-500">*</span></Label>
            <select
              id="sourceId"
              name="sourceId"
              value={formData.sourceId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              <option value="">Select source</option>
              {nodes.map(entity => (
                <option key={entity._id || entity.id} value={entity._id || entity.id}>
                  {entity.name || entity.data?.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetId">Target Table <span className="text-red-500">*</span></Label>
            <select
              id="targetId"
              name="targetId"
              value={formData.targetId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              <option value="">Select target</option>
              {nodes
                .filter(entity => (entity._id || entity.id) !== formData.sourceId)
                .map(entity => (
                  <option key={entity._id || entity.id} value={entity._id || entity.id}>
                    {entity.name || entity.data?.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        
        <Separator />
        
        {/* ON DELETE and ON UPDATE behavior */}
        <div className="space-y-4">
          <Label className="text-sm font-medium block">FOREIGN KEY OPTIONS</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="onDelete">ON DELETE</Label>
              <select
                id="onDelete"
                name="onDelete"
                value={formData.onDelete}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="NO ACTION">NO ACTION</option>
                <option value="RESTRICT">RESTRICT</option>
                <option value="CASCADE">CASCADE</option>
                <option value="SET NULL">SET NULL</option>
                <option value="SET DEFAULT">SET DEFAULT</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Action when source record is deleted
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="onUpdate">ON UPDATE</Label>
              <select
                id="onUpdate"
                name="onUpdate"
                value={formData.onUpdate}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="NO ACTION">NO ACTION</option>
                <option value="RESTRICT">RESTRICT</option>
                <option value="CASCADE">CASCADE</option>
                <option value="SET NULL">SET NULL</option>
                <option value="SET DEFAULT">SET DEFAULT</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Action when source record is updated
              </p>
            </div>
          </div>
        </div>
      </form>
      
      {/* Footer Actions */}
      <div className="border-t p-4 bg-slate-50 dark:bg-slate-900 flex justify-between">
        {relationship && onDelete ? (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this relationship?")) {
                onDelete();
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        ) : (
          <div></div> 
        )}
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            size="sm"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.sourceId || !formData.targetId}
          >
            <Save className="h-4 w-4 mr-2" />
            {relationship ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelationshipForm;
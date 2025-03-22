import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

const AttributeForm = ({ 
  attribute = null,  // If provided, we're editing an existing attribute
  entityId,          // Required for creating new attributes
  onSave,            // Save callback
  onCancel           // Cancel callback
}) => {
  const [formData, setFormData] = useState({
    name: attribute?.name || '',
    dataType: attribute?.dataType || 'String',
    isPrimaryKey: attribute?.isPrimaryKey || false,
    isForeignKey: attribute?.isForeignKey || false,
    isNullable: attribute?.isNullable ?? true, // Default to true for new attributes
    isUnique: attribute?.isUnique || false,
    defaultValue: attribute?.defaultValue || '',
    position: attribute?.position || { x: 0, y: 0 }
  });

  // Available data types
  const dataTypes = [
    'String', 'Number', 'Boolean', 'Date', 'ObjectId', 
    'Array', 'Object', 'Buffer', 'Mixed', 'Decimal', 
    'Integer', 'BigInt', 'Email', 'URL', 'Float', 
    'Double', 'UUID', 'Text', 'JSON'
  ];

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (field, checked) => {
    // Special logic for primary keys
    if (field === 'isPrimaryKey' && checked) {
      // If setting as primary key, also set not nullable and unique
      setFormData(prev => ({
        ...prev,
        [field]: checked,
        isNullable: false,
        isUnique: true
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: checked
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      alert('Attribute name is required');
      return;
    }
    
    // If editing existing attribute
    if (attribute) {
      onSave(attribute._id, formData);
    } else {
      // Creating new attribute
      onSave(formData);
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
          {attribute ? 'Edit Attribute' : 'Add Attribute'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {attribute ? 'Modify attribute properties' : 'Define a new attribute for this entity'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label htmlFor="name">Attribute Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. id, name, createdAt"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dataType">Data Type <span className="text-red-500">*</span></Label>
          <select
            id="dataType"
            name="dataType"
            value={formData.dataType}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-background"
            required
          >
            {dataTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPrimaryKey" 
                checked={formData.isPrimaryKey} 
                onCheckedChange={(checked) => handleCheckboxChange('isPrimaryKey', checked)}
              />
              <Label htmlFor="isPrimaryKey" className="cursor-pointer">Primary Key</Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Entity's unique identifier
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isForeignKey" 
                checked={formData.isForeignKey} 
                onCheckedChange={(checked) => handleCheckboxChange('isForeignKey', checked)}
              />
              <Label htmlFor="isForeignKey" className="cursor-pointer">Foreign Key</Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Reference to another entity
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isNullable" 
                checked={formData.isNullable} 
                onCheckedChange={(checked) => handleCheckboxChange('isNullable', checked)}
                disabled={formData.isPrimaryKey} // Can't be nullable if it's a primary key
              />
              <Label 
                htmlFor="isNullable" 
                className={`cursor-pointer ${formData.isPrimaryKey ? 'text-muted-foreground' : ''}`}
              >
                Nullable
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Value can be null/undefined
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isUnique" 
                checked={formData.isUnique} 
                onCheckedChange={(checked) => handleCheckboxChange('isUnique', checked)}
                disabled={formData.isPrimaryKey} // Always unique if it's a primary key
              />
              <Label 
                htmlFor="isUnique" 
                className={`cursor-pointer ${formData.isPrimaryKey ? 'text-muted-foreground' : ''}`}
              >
                Unique
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Value must be unique
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="defaultValue">Default Value</Label>
          <Input
            id="defaultValue"
            name="defaultValue"
            value={formData.defaultValue}
            onChange={handleChange}
            placeholder="Default value (optional)"
          />
          <p className="text-xs text-muted-foreground">
            Default value if not specified
          </p>
        </div>
        
        <div className="pt-6 flex justify-end mt-auto">
          <Button type="button" variant="outline" onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button type="submit">
            {attribute ? 'Update Attribute' : 'Add Attribute'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AttributeForm;
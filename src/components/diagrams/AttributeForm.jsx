import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
    isNullable: attribute?.isNullable ?? true,
    isUnique: attribute?.isUnique || false,
    isAutoIncrement: attribute?.isAutoIncrement || false,
    isUnsigned: attribute?.isUnsigned || false,
    defaultValue: attribute?.defaultValue || '',
    comment: attribute?.comment || '',
    position: attribute?.position || { x: 0, y: 0 }
  });

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle checkbox change with special logic
  const handleCheckboxChange = (field, checked) => {
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
            {attribute ? 'Edit Attribute' : 'New Attribute'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
        {/* Column Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Column Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. id, name, email"
            required
            autoFocus
          />
        </div>
        
        {/* Data Type */}
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
            <optgroup label="Common Types">
              <option value="String">String</option>
              <option value="Number">Number</option>
              <option value="Boolean">Boolean</option>
              <option value="Date">Date</option>
              <option value="ObjectId">ObjectId</option>
            </optgroup>
            <optgroup label="SQL Types">
              <option value="varchar">varchar</option>
              <option value="int">int</option>
              <option value="bigint">bigint</option>
              <option value="text">text</option>
              <option value="datetime">datetime</option>
              <option value="decimal">decimal</option>
              <option value="float">float</option>
              <option value="bit">bit</option>
            </optgroup>
          </select>
        </div>
        
        <Separator />
        
        {/* Column Attributes */}
        <div>
          <Label className="text-sm font-medium mb-3 block">COLUMN ATTRIBUTES</Label>
          
          <div className="space-y-2 pl-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPrimaryKey" 
                checked={formData.isPrimaryKey} 
                onCheckedChange={(checked) => handleCheckboxChange('isPrimaryKey', checked)}
              />
              <Label htmlFor="isPrimaryKey" className="text-sm cursor-pointer">
                Primary Key
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isForeignKey" 
                checked={formData.isForeignKey} 
                onCheckedChange={(checked) => handleCheckboxChange('isForeignKey', checked)}
              />
              <Label htmlFor="isForeignKey" className="text-sm cursor-pointer">
                Foreign Key
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isAutoIncrement" 
                checked={formData.isAutoIncrement} 
                onCheckedChange={(checked) => setFormData({...formData, isAutoIncrement: checked})}
              />
              <Label htmlFor="isAutoIncrement" className="text-sm cursor-pointer">
                Auto increment
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isUnsigned" 
                checked={formData.isUnsigned} 
                onCheckedChange={(checked) => setFormData({...formData, isUnsigned: checked})}
              />
              <Label htmlFor="isUnsigned" className="text-sm cursor-pointer">
                Unsigned
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isUnique" 
                checked={formData.isUnique} 
                onCheckedChange={(checked) => handleCheckboxChange('isUnique', checked)}
                disabled={formData.isPrimaryKey}
              />
              <Label 
                htmlFor="isUnique" 
                className={`text-sm cursor-pointer ${formData.isPrimaryKey ? 'text-muted-foreground' : ''}`}
              >
                Unique
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isNullable" 
                checked={formData.isNullable} 
                onCheckedChange={(checked) => handleCheckboxChange('isNullable', checked)}
                disabled={formData.isPrimaryKey}
              />
              <Label 
                htmlFor="isNullable" 
                className={`text-sm cursor-pointer ${formData.isPrimaryKey ? 'text-muted-foreground' : ''}`}
              >
                Nullable
              </Label>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Default Value */}
        <div className="space-y-2">
          <Label htmlFor="defaultValue">Default</Label>
          <Input
            id="defaultValue"
            name="defaultValue"
            value={formData.defaultValue}
            onChange={handleChange}
            placeholder="Default value"
          />
        </div>
        
        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment">Comment</Label>
          <Input
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Optional description for this column"
          />
        </div>
      </form>
      
      {/* Footer Actions */}
      <div className="border-t p-4 bg-slate-50 dark:bg-slate-900 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancel}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <Button
          size="sm"
          onClick={handleSubmit}
        >
          <Save className="h-4 w-4 mr-2" />
          {attribute ? 'Update column' : 'Add column'}
        </Button>
      </div>
    </div>
  );
};

export default AttributeForm;
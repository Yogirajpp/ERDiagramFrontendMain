import { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttributeList from './AttributeList';

const EntityForm = ({ 
  entity, 
  onUpdate, 
  onDelete, 
  onAddAttribute, 
  onUpdateAttribute,
  onDeleteAttribute
}) => {
  const [formData, setFormData] = useState({
    name: entity.data?.name || '',
    type: entity.data?.type || 'regular',
    style: entity.data?.style || {}
  });
  const [activeTab, setActiveTab] = useState('general');

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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the entity ID and form data to onUpdate
    onUpdate(entity.id, formData);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-1">Entity Properties</h2>
        <p className="text-sm text-muted-foreground">
          Edit properties for this entity
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="attributes" className="flex-1">Attributes</TabsTrigger>
            <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto">
          <TabsContent value="general" className="p-4 space-y-4 h-full">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Entity Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Entity name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Entity Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="regular">Regular Entity</option>
                    <option value="weak">Weak Entity</option>
                    <option value="associative">Associative Entity</option>
                  </select>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Entity
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="attributes" className="p-4 space-y-4 h-full">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Entity Attributes</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onAddAttribute}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>
            
            <Separator />
            
            <AttributeList 
              attributes={entity.data?.attributes} 
              onEdit={(attrId) => {
                // Find the attribute and prepare for editing
                const attribute = entity.data?.attributes.find(a => a._id === attrId);
                if (attribute && onUpdateAttribute) {
                  // Call the update handler with the attribute data
                  // This would typically open an edit form
                  onUpdateAttribute(entity.id, attrId, attribute);
                }
              }}
              onDelete={(attrId) => onDeleteAttribute(entity.id, attrId)}
            />
          </TabsContent>
          
          <TabsContent value="style" className="p-4 space-y-4 h-full">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    id="backgroundColor"
                    name="backgroundColor"
                    value={formData.style.backgroundColor || '#ffffff'}
                    onChange={handleStyleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.style.backgroundColor || '#ffffff'}
                    onChange={handleStyleChange}
                    name="backgroundColor"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="borderColor">Border Color</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    id="borderColor"
                    name="borderColor"
                    value={formData.style.borderColor || '#000000'}
                    onChange={handleStyleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.style.borderColor || '#000000'}
                    onChange={handleStyleChange}
                    name="borderColor"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    id="textColor"
                    name="textColor"
                    value={formData.style.textColor || '#000000'}
                    onChange={handleStyleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.style.textColor || '#000000'}
                    onChange={handleStyleChange}
                    name="textColor"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="borderWidth">Border Width</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="range"
                    min="1"
                    max="5"
                    id="borderWidth"
                    name="borderWidth"
                    value={formData.style.borderWidth || 1}
                    onChange={handleStyleChange}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">
                    {formData.style.borderWidth || 1}px
                  </span>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleSubmit}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Style
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default EntityForm;
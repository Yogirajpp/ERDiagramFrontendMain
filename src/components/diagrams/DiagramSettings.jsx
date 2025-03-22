import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const DiagramSettings = ({ diagram, onUpdate, onBack }) => {
  const [formData, setFormData] = useState({
    name: diagram?.name || '',
    description: diagram?.description || '',
    isPublic: diagram?.isPublic || false,
    version: diagram?.version || 1
  });

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
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      alert('Diagram name is required');
      return;
    }
    
    onUpdate(formData);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-semibold mt-2">Diagram Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage diagram properties and settings
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label htmlFor="name">Diagram Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="My ER Diagram"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the purpose of this diagram..."
            rows={3}
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isPublic" 
              checked={formData.isPublic} 
              onCheckedChange={(checked) => handleCheckboxChange('isPublic', checked)}
            />
            <Label htmlFor="isPublic" className="cursor-pointer">Public Diagram</Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Public diagrams can be viewed by anyone with the link (read-only)
          </p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="version"
              name="version"
              type="number"
              min="1"
              step="0.1"
              value={formData.version}
              onChange={handleChange}
              className="w-28"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setFormData(prev => ({
                ...prev,
                version: parseFloat((parseFloat(prev.version) + 0.1).toFixed(1))
              }))}
            >
              Increment
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Used for versioning your diagram design
          </p>
        </div>
        
        <div className="flex justify-between bg-muted p-4 rounded-md items-center mt-4">
          <div>
            <h3 className="font-medium">Diagram Information</h3>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(diagram?.createdAt).toLocaleDateString()}<br />
              Last modified: {new Date(diagram?.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">
              Entities: {diagram?.entities?.length || 0}<br />
              Relationships: {diagram?.relationships?.length || 0}
            </p>
          </div>
        </div>
        
        <div className="pt-6 flex justify-end mt-auto">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DiagramSettings;
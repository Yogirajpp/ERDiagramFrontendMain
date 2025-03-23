import { useState } from 'react';
import { Plus, Save, Trash2, Edit, ChevronDown, ChevronRight, KeyRound, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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
    type: entity.data?.type || 'regular'
  });
  
  const [showAttributes, setShowAttributes] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(entity.id, formData);
    setIsDirty(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Entity Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={formData.name}
              name="name"
              onChange={handleChange}
              placeholder="Entity Name"
              className="text-lg font-medium bg-transparent border-0 border-b border-dashed focus-visible:ring-0 px-0 mb-2"
            />
            
            <div className="flex items-center">
              <select
                value={formData.type}
                name="type"
                onChange={handleChange}
                className="text-xs bg-transparent border-0 focus-visible:ring-0 px-0 text-muted-foreground"
              >
                <option value="regular">Regular Entity</option>
                <option value="weak">Weak Entity</option>
                <option value="associative">Associative Entity</option>
              </select>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSubmit}
            disabled={!isDirty}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
      
      {/* Attributes Section */}
      <div className="p-4 flex-1 overflow-auto">
        <div className="border rounded-md bg-slate-50 dark:bg-slate-900 mb-4">
          <div 
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setShowAttributes(!showAttributes)}
          >
            <div className="flex items-center">
              {showAttributes ? 
                <ChevronDown className="h-4 w-4 mr-2" /> : 
                <ChevronRight className="h-4 w-4 mr-2" />
              }
              <span className="font-medium">Columns</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {entity.data?.attributes?.length || 0}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddAttribute();
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showAttributes && entity.data?.attributes?.length > 0 && (
            <div className="p-2 border-t">
              <div className="bg-white dark:bg-slate-800 rounded border overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 text-xs font-medium border-b bg-slate-100 dark:bg-slate-700">
                  <div className="col-span-5 p-2">Name</div>
                  <div className="col-span-3 p-2">Type</div>
                  <div className="col-span-2 p-2 text-center">Properties</div>
                  <div className="col-span-2 p-2 text-center"></div>
                </div>
                
                {/* Attribute Rows */}
                <div className="max-h-[300px] overflow-y-auto">
                  {entity.data.attributes.map(attr => (
                    <div key={attr._id} className="grid grid-cols-12 text-sm border-b hover:bg-slate-50 dark:hover:bg-slate-700">
                      <div className="col-span-5 p-2 flex items-center">
                        {attr.isPrimaryKey && <KeyRound className="h-3.5 w-3.5 mr-1.5 text-blue-500" />}
                        <span className="truncate">{attr.name}</span>
                      </div>
                      <div className="col-span-3 p-2 text-xs">
                        {attr.dataType}
                      </div>
                      <div className="col-span-2 p-2 flex flex-col items-center text-center">
                        {attr.isPrimaryKey && (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-sm mb-1">PK</span>
                        )}
                        {attr.isAutoIncrement && (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-sm mb-1">AI</span>
                        )}
                        {!attr.isNullable && (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-sm">Required</span>
                        )}
                      </div>
                      <div className="col-span-2 p-2 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const attribute = entity.data?.attributes.find(a => a._id === attr._id);
                            if (attribute) {
                              onUpdateAttribute(entity.id, attr._id, attribute);
                            }
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-1"
                          onClick={() => onDeleteAttribute(entity.id, attr._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {showAttributes && entity.data?.attributes?.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              <p>No columns defined</p>
              <Button
                variant="link"
                size="sm"
                onClick={onAddAttribute}
                className="mt-1"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add column
              </Button>
            </div>
          )}
        </div>
        
        {/* Indexes Section (placeholder) */}
        <div className="border rounded-md bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 mr-2" />
              <span className="font-medium">Indexes</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="border-t p-4 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex space-x-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Table
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddAttribute}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Column
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EntityForm;
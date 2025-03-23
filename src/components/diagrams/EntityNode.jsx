import { useCallback, useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDiagram } from '@/contexts/DiagramContext';
import useAttributes from '@/hooks/useAttributes';
import useEntities from '@/hooks/useEntities';

const EntityNode = ({ data, selected, id }) => {
  // Get entity data
  const { name, type, attributes = [], style = {} } = data;
  
  // Access diagram context
  const { setSelectedNode, setSidebarMode } = useDiagram();
  const { updateEntity, deleteEntity } = useEntities();
  const { createAttribute, updateAttribute, deleteAttribute } = useAttributes();

  // Local state for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedType, setEditedType] = useState(type || 'regular');
  const [showAttributes, setShowAttributes] = useState(false);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    dataType: 'String',
    isPrimaryKey: false
  });
  
  // Ref for attribute input focus
  const attributeInputRef = useRef(null);
  
  // Default styles
  const defaultStyle = {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1,
    textColor: '#000000'
  };
  
  // Merge default and custom styles
  const mergedStyle = { ...defaultStyle, ...style };
  
  // Style based on entity type
  const getTypeStyle = useCallback(() => {
    switch (type) {
      case 'weak':
        return {
          container: 'border-dashed',
          header: 'bg-yellow-50 dark:bg-yellow-900/20 border-b border-dashed',
          title: 'text-yellow-700 dark:text-yellow-400'
        };
      case 'associative':
        return {
          container: 'border-2',
          header: 'bg-green-50 dark:bg-green-900/20 border-b border-2',
          title: 'text-green-700 dark:text-green-400'
        };
      default:
        return {
          container: 'border',
          header: 'bg-blue-50 dark:bg-blue-900/20 border-b',
          title: 'text-blue-700 dark:text-blue-400'
        };
    }
  }, [type]);
  
  const typeStyle = getTypeStyle();
  
  // Get primary keys or IDs
  const primaryKeys = attributes.filter(attr => attr.isPrimaryKey);
  
  // Group other attributes
  const normalAttributes = attributes.filter(attr => !attr.isPrimaryKey);

  // Handle entity name and type update
  const handleSaveEntity = () => {
    if (editedName.trim()) {
      updateEntity(id, { name: editedName, type: editedType });
      setIsEditing(false);
    }
  };

  // Handle attribute creation
  const handleAddAttribute = (e) => {
    e.preventDefault();
    if (newAttribute.name.trim()) {
      createAttribute(id, newAttribute);
      setNewAttribute({
        name: '',
        dataType: 'String',
        isPrimaryKey: false
      });
      // Focus back on the input for quick consecutive additions
      if (attributeInputRef.current) {
        attributeInputRef.current.focus();
      }
    }
  };

  // Handle attribute deletion
  const handleDeleteAttribute = (attributeId) => {
    if (window.confirm("Delete this column?")) {
      deleteAttribute(id, attributeId);
    }
  };

  // Handle entity deletion
  const handleDeleteEntity = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete table "${name}"?`)) {
      deleteEntity(id);
    }
  };

  return (
    <div 
      className={`rounded-md shadow-md ${typeStyle.container} ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ 
        borderColor: mergedStyle.borderColor,
        borderWidth: `${mergedStyle.borderWidth}px`,
        backgroundColor: mergedStyle.backgroundColor,
        minWidth: '250px',
        maxWidth: '320px'
      }}
    >
      {/* Entity header with controls */}
      <div 
        className={`${typeStyle.header} rounded-t-md p-2 flex justify-between items-center`}
        style={{ 
          borderColor: mergedStyle.borderColor,
          borderWidth: `${mergedStyle.borderWidth}px`
        }}
      >
        {isEditing ? (
          <Input 
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="h-6 text-sm w-full mr-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEntity();
              }
            }}
          />
        ) : (
          <h3 
            className={`truncate ${typeStyle.title} flex-1 text-center`}
            style={{ color: mergedStyle.textColor }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {name || 'Entity'}
          </h3>
        )}
        
        {isEditing ? (
          <div className="flex">
            <select
              value={editedType}
              onChange={(e) => setEditedType(e.target.value)}
              className="h-6 text-xs mr-1 border rounded"
            >
              <option value="regular">Regular</option>
              <option value="weak">Weak</option>
              <option value="associative">Junction</option>
            </select>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={handleSaveEntity}
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-5 w-5 p-0"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-5 w-5 p-0 text-red-500"
              onClick={handleDeleteEntity}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Entity attributes with toggle */}
      <div className="p-2">
        {/* Primary keys */}
        {primaryKeys.length > 0 && (
          <div className="space-y-1 mb-2">
            {primaryKeys.map((attr) => (
              <div key={attr._id} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <span className="text-xs font-medium underline mr-2">PK</span>
                  <span 
                    className="text-xs truncate"
                    style={{ color: mergedStyle.textColor }}
                  >
                    {attr.name}
                    <span className="text-xs text-gray-500 ml-1">
                      ({attr.dataType})
                    </span>
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-red-500"
                  onClick={() => handleDeleteAttribute(attr._id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Other attributes - shown/hidden based on toggle */}
        {normalAttributes.length > 0 && (
          <div className="space-y-1">
            {(showAttributes ? normalAttributes : normalAttributes.slice(0, 3)).map((attr) => (
              <div key={attr._id} className="flex items-center justify-between group">
                <span 
                  className={`text-xs truncate ${attr.isNullable ? '' : 'font-medium'} ${attr.isForeignKey ? 'italic' : ''}`}
                  style={{ color: mergedStyle.textColor }}
                >
                  {attr.name}
                  <span className="text-xs text-gray-500 ml-1">
                    ({attr.dataType})
                  </span>
                  {attr.isUnique && <span className="text-xs text-blue-500 ml-1">U</span>}
                  {attr.isForeignKey && <span className="text-xs text-purple-500 ml-1">FK</span>}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-red-500"
                  onClick={() => handleDeleteAttribute(attr._id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {normalAttributes.length > 3 && (
              <button
                className="text-xs text-blue-500 w-full text-center mt-1"
                onClick={() => setShowAttributes(!showAttributes)}
              >
                {showAttributes ? (
                  <span className="flex items-center justify-center">
                    <ChevronUp className="h-3 w-3 mr-1" /> Hide columns
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <ChevronDown className="h-3 w-3 mr-1" /> Show all ({normalAttributes.length})
                  </span>
                )}
              </button>
            )}
          </div>
        )}
        
        {attributes.length === 0 && (
          <div className="text-xs text-gray-400 italic">No attributes</div>
        )}
      </div>
      
      {/* Quick add attribute popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-1 h-6 text-xs flex items-center justify-center border-t rounded-none rounded-b-md"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Column
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2">
          <form onSubmit={handleAddAttribute} className="space-y-2">
            <div className="grid grid-cols-12 gap-1">
              <div className="col-span-5">
                <Input
                  ref={attributeInputRef}
                  value={newAttribute.name}
                  onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                  placeholder="Column name"
                  className="w-full h-7 text-xs"
                />
              </div>
              
              <div className="col-span-5">
                <select
                  value={newAttribute.dataType}
                  onChange={(e) => setNewAttribute({...newAttribute, dataType: e.target.value})}
                  className="w-full p-1 border rounded text-xs h-7"
                >
                  <option value="String">String</option>
                  <option value="Number">Number</option>
                  <option value="Boolean">Boolean</option>
                  <option value="Date">Date</option>
                  <option value="varchar">varchar</option>
                  <option value="int">int</option>
                  <option value="text">text</option>
                  <option value="datetime">datetime</option>
                </select>
              </div>
              
              <div className="col-span-2 flex items-center justify-center">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newAttribute.isPrimaryKey}
                    onChange={(e) => setNewAttribute({...newAttribute, isPrimaryKey: e.target.checked})}
                    className="rounded border-gray-300 h-3 w-3"
                  />
                  <span className="text-xs ml-1">PK</span>
                </label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              size="sm"
              className="w-full h-6 text-xs"
              disabled={!newAttribute.name.trim()}
            >
              Add
            </Button>
          </form>
        </PopoverContent>
      </Popover>
      
      {/* Connection handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-2 h-2 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-2 h-2 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-2 h-2 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-2 h-2 bg-blue-500 border-2 border-white"
      />
    </div>
  );
};

export default EntityNode;
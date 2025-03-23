import { useCallback, useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save, Key, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
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
    isPrimaryKey: false,
    isNullable: true,
    isUnique: false
  });
  
  // Ref for attribute input focus
  const attributeInputRef = useRef(null);
  
  // Default styles based on entity type
  const getTypeConfig = useCallback(() => {
    switch (editedType) {
      case 'weak':
        return {
          style: {
            backgroundColor: '#FFFBEB',
            borderColor: '#F59E0B',
            borderWidth: 1,
            textColor: '#78350F'
          },
          container: 'border-dashed border-amber-400',
          header: 'bg-amber-50 border-b border-dashed border-amber-400',
          title: 'text-amber-800 font-medium'
        };
      case 'associative':
        return {
          style: {
            backgroundColor: '#ECFDF5',
            borderColor: '#10B981',
            borderWidth: 2,
            textColor: '#065F46'
          },
          container: 'border-2 border-emerald-500',
          header: 'bg-emerald-50 border-b-2 border-emerald-500',
          title: 'text-emerald-800 font-medium'
        };
      default:
        return {
          style: {
            backgroundColor: '#F0F9FF',
            borderColor: '#0EA5E9',
            borderWidth: 1,
            textColor: '#0C4A6E'
          },
          container: 'border border-sky-400',
          header: 'bg-sky-50 border-b border-sky-400',
          title: 'text-sky-800 font-medium'
        };
    }
  }, [editedType]);

  // Get styling configuration
  const typeConfig = getTypeConfig();
  
  // Merge default and custom styles
  const mergedStyle = { ...typeConfig.style, ...style };
  
  // Get primary keys or IDs
  const primaryKeys = attributes.filter(attr => attr.isPrimaryKey);
  
  // Group other attributes
  const normalAttributes = attributes.filter(attr => !attr.isPrimaryKey);

  // Handle entity name and type update
  const handleSaveEntity = () => {
    if (editedName.trim()) {
      updateEntity(id, { 
        name: editedName, 
        type: editedType,
        style: typeConfig.style // Apply type-based styles
      });
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
        isPrimaryKey: false,
        isNullable: true,
        isUnique: false
      });
      // Focus back on the input for quick consecutive additions
      if (attributeInputRef.current) {
        attributeInputRef.current.focus();
      }
    }
  };

  // Handle attribute deletion with confirmation
  const handleDeleteAttribute = (attributeId, attributeName) => {
    if (window.confirm(`Delete column "${attributeName}"?`)) {
      deleteAttribute(id, attributeId);
    }
  };

  // Handle entity deletion with confirmation
  const handleDeleteEntity = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete table "${name}"?`)) {
      deleteEntity(id);
    }
  };

  // Get data type display
  const getDataTypeDisplay = (dataType) => {
    const typeMap = {
      'String': 'string',
      'Number': 'number',
      'Boolean': 'bool',
      'Date': 'date',
      'varchar': 'varchar',
      'int': 'int',
      'text': 'text',
      'datetime': 'datetime'
    };
    
    return typeMap[dataType] || dataType;
  };

  return (
    <TooltipProvider>
      <div 
        className={`rounded-lg shadow-lg ${typeConfig.container} ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        style={{ 
          backgroundColor: mergedStyle.backgroundColor,
          borderColor: mergedStyle.borderColor,
          borderWidth: `${mergedStyle.borderWidth}px`,
          minWidth: '250px',
          maxWidth: '320px',
          transition: 'all 0.2s ease'
        }}
        onClick={() => {
          setSelectedNode(id);
          setSidebarMode('entity');
        }}
      >
      {/* Entity header with controls */}
      <div 
        className={`${typeConfig.header} rounded-t-lg p-3 flex justify-between items-center`}
        style={{ 
          borderColor: mergedStyle.borderColor
        }}
      >
        {isEditing ? (
          <Input 
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="h-7 text-sm w-full mr-1 bg-white/80"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEntity();
              }
            }}
          />
        ) : (
          <h3 
            className={`truncate ${typeConfig.title} flex-1 text-center text-sm`}
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
              className="h-7 text-xs mr-1 border rounded bg-white/80"
            >
              <option value="regular">Regular</option>
              <option value="weak">Weak</option>
              <option value="associative">Junction</option>
            </select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={handleSaveEntity}
                >
                  <Save className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Save changes</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 hover:bg-white/20"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Edit table</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 hover:bg-red-50 text-red-500"
                  onClick={handleDeleteEntity}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Delete table</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
      
      {/* Entity attributes section */}
      <div className="p-3 bg-white/80">
        {/* Primary keys */}
        {primaryKeys.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {primaryKeys.map((attr) => (
              <div key={attr._id} className="flex items-center justify-between group px-1 py-0.5 rounded hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Key className="h-3 w-3 text-amber-500 mr-1" />
                    <span 
                      className="text-xs font-medium"
                      style={{ color: mergedStyle.textColor }}
                    >
                      {attr.name}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500 ml-1.5 italic">
                    {getDataTypeDisplay(attr.dataType)}
                  </span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteAttribute(attr._id, attr.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Delete column</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
        
        {/* Divider between keys and other attributes */}
        {primaryKeys.length > 0 && normalAttributes.length > 0 && (
          <div className="h-px bg-gray-200 my-2" />
        )}
        
        {/* Regular attributes - shown/hidden based on toggle */}
        {normalAttributes.length > 0 && (
          <div className="space-y-1.5">
            {(showAttributes ? normalAttributes : normalAttributes.slice(0, 3)).map((attr) => (
              <div key={attr._id} className="flex items-center justify-between group px-1 py-0.5 rounded hover:bg-gray-50">
                <div className="flex items-center">
                  {attr.isForeignKey && (
                    <Lock className="h-3 w-3 text-purple-500 mr-1" />
                  )}
                  <span 
                    className={`text-xs ${attr.isNullable ? '' : 'font-medium'} ${attr.isForeignKey ? 'italic' : ''}`}
                    style={{ color: mergedStyle.textColor }}
                  >
                    {attr.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-1.5 italic">
                    {getDataTypeDisplay(attr.dataType)}
                  </span>
                  {attr.isUnique && <span className="text-xs text-blue-500 ml-1">◆</span>}
                  {!attr.isNullable && <span className="text-xs text-red-500 ml-1">*</span>}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteAttribute(attr._id, attr.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Delete column</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
            
            {normalAttributes.length > 3 && (
              <button
                className="text-xs w-full text-center mt-1 py-1 rounded hover:bg-gray-50"
                style={{ color: mergedStyle.borderColor }}
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
          <div className="text-xs text-gray-400 italic py-2 text-center">No columns defined</div>
        )}
      </div>
      
      {/* Quick add attribute popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full h-8 text-xs flex items-center justify-center border-t rounded-none rounded-b-lg"
            style={{ 
              borderColor: mergedStyle.borderColor,
              color: mergedStyle.borderColor,
              backgroundColor: mergedStyle.backgroundColor
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Column
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3">
          <form onSubmit={handleAddAttribute} className="space-y-3">
            <div className="space-y-2">
              <Input
                ref={attributeInputRef}
                value={newAttribute.name}
                onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                placeholder="Column name"
                className="w-full h-8 text-xs"
              />
              
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7">
                  <select
                    value={newAttribute.dataType}
                    onChange={(e) => setNewAttribute({...newAttribute, dataType: e.target.value})}
                    className="w-full p-1.5 border rounded text-xs h-8"
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
                
                <div className="col-span-5 flex space-x-1">
                  <label className="flex items-center cursor-pointer bg-gray-50 px-2 rounded border flex-1">
                    <input 
                      type="checkbox" 
                      checked={newAttribute.isPrimaryKey}
                      onChange={(e) => setNewAttribute({...newAttribute, isPrimaryKey: e.target.checked})}
                      className="rounded border-gray-300 h-3 w-3"
                    />
                    <span className="text-xs ml-1">PK</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer bg-gray-50 px-2 rounded border flex-1">
                    <input 
                      type="checkbox" 
                      checked={newAttribute.isUnique}
                      onChange={(e) => setNewAttribute({...newAttribute, isUnique: e.target.checked})}
                      className="rounded border-gray-300 h-3 w-3"
                    />
                    <span className="text-xs ml-1">UQ</span>
                  </label>
                </div>
              </div>
              
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!newAttribute.isNullable}
                  onChange={(e) => setNewAttribute({...newAttribute, isNullable: !e.target.checked})}
                  className="rounded border-gray-300 h-3 w-3"
                />
                <span className="text-xs ml-1">Not Null</span>
              </label>
            </div>
            
            <Button 
              type="submit" 
              size="sm"
              className="w-full h-7 text-xs"
              disabled={!newAttribute.name.trim()}
            >
              Add Column
            </Button>
          </form>
        </PopoverContent>
      </Popover>
      
      {/* Connection handles with styling */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-blue-500 border-2 border-white right-[-7px]"
        style={{ borderRadius: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-blue-500 border-2 border-white bottom-[-7px]"
        style={{ borderRadius: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-blue-500 border-2 border-white left-[-7px]"
        style={{ borderRadius: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-blue-500 border-2 border-white top-[-7px]"
        style={{ borderRadius: '50%' }}
      />
    </div>
    </TooltipProvider>
  );
};

export default EntityNode;
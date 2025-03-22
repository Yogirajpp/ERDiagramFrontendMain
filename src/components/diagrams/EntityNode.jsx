import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

const EntityNode = ({ data, selected }) => {
  // Get entity data
  const { name, type, attributes = [], style = {} } = data;
  
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

  return (
    <div 
      className={`rounded-md shadow-md ${typeStyle.container} ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ 
        borderColor: mergedStyle.borderColor,
        borderWidth: `${mergedStyle.borderWidth}px`,
        backgroundColor: mergedStyle.backgroundColor,
        minWidth: '180px',
        maxWidth: '250px'
      }}
    >
      {/* Entity header */}
      <div 
        className={`${typeStyle.header} rounded-t-md p-2 text-center font-medium`}
        style={{ 
          borderColor: mergedStyle.borderColor,
          borderWidth: `${mergedStyle.borderWidth}px`
        }}
      >
        <h3 
          className={`truncate ${typeStyle.title}`}
          style={{ color: mergedStyle.textColor }}
        >
          {name || 'Entity'}
        </h3>
      </div>
      
      {/* Entity attributes */}
      <div className="p-2">
        {/* Primary keys */}
        {primaryKeys.length > 0 && (
          <div className="space-y-1 mb-2">
            {primaryKeys.map((attr) => (
              <div key={attr._id} className="flex items-center">
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
            ))}
          </div>
        )}
        
        {/* Other attributes */}
        <div className="space-y-1">
          {normalAttributes.map((attr) => (
            <div key={attr._id} className="flex items-center">
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
            </div>
          ))}
          
          {attributes.length === 0 && (
            <div className="text-xs text-gray-400 italic">No attributes</div>
          )}
        </div>
      </div>
      
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
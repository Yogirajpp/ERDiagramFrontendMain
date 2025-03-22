import { useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';

const RelationshipEdge = ({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected, style = {} }) => {
  // Get edge data
  const { name, type, entities = [], style: edgeStyle = {} } = data || {};
  
  // Default styles
  const defaultStyle = {
    lineColor: '#000000',
    lineStyle: 'solid',
    lineWidth: 1,
    textColor: '#000000'
  };
  
  // Merge default and custom styles
  const mergedStyle = { ...defaultStyle, ...edgeStyle };
  
  // Get relationship cardinality symbols
  const getCardinalitySymbol = useCallback((cardinality) => {
    switch(cardinality) {
      case '0..1':
        return '0..1';
      case '1':
        return '1';
      case '0..n':
        return '0..*';
      case '1..n':
        return '1..*';
      case 'n':
        return '*';
      default:
        return '';
    }
  }, []);
  
  // Get entity by id
  const getEntityById = useCallback((entityId) => {
    return entities.find(e => e.entityId._id === entityId);
  }, [entities]);
  
  // Get source and target entities
  const sourceEntity = getEntityById(source);
  const targetEntity = getEntityById(target);
  
  // Get edge path
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16
  });
  
  // Determine dash array for line style
  const getDashArray = useCallback((lineStyle) => {
    switch(lineStyle) {
      case 'dashed':
        return '5, 5';
      case 'dotted':
        return '1, 5';
      default:
        return 'none';
    }
  }, []);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: mergedStyle.lineColor,
          strokeWidth: mergedStyle.lineWidth,
          strokeDasharray: getDashArray(mergedStyle.lineStyle),
          ...(selected && { strokeWidth: mergedStyle.lineWidth + 1, stroke: '#3b82f6' })
        }}
      />
      
      {/* Relationship name */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: 'all',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          className="nodrag nopan"
        >
          {name || type}
        </div>
      </EdgeLabelRenderer>
      
      {/* Source cardinality */}
      {sourceEntity && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + (targetX - sourceX) * 0.15}px,${sourceY + (targetY - sourceY) * 0.15}px)`,
              fontSize: 12,
              fontWeight: 'bold',
              pointerEvents: 'none'
            }}
          >
            {getCardinalitySymbol(sourceEntity.cardinality)}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Target cardinality */}
      {targetEntity && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX + (sourceX - targetX) * 0.15}px,${targetY + (sourceY - targetY) * 0.15}px)`,
              fontSize: 12,
              fontWeight: 'bold',
              pointerEvents: 'none'
            }}
          >
            {getCardinalitySymbol(targetEntity.cardinality)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default RelationshipEdge;
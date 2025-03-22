import { useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EntityNode from './EntityNode';
import RelationshipEdge from './RelationshipEdge';

// Define node types
const nodeTypes = {
  entity: EntityNode,
};

// Define edge types
const edgeTypes = {
  relationship: RelationshipEdge,
};

const DiagramCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onConnect,
  onDrop,
  onDragOver,
  readOnly = false,
  onExportImage,
  onInit,
}) => {
  const reactFlowWrapper = useRef(null);

  // Export image handler
  const handleExportImage = () => {
    if (onExportImage) {
      onExportImage();
    }
  };

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : (params) => onConnect(params)}
        onInit={onInit}
        onDrop={readOnly ? undefined : onDrop}
        onDragOver={readOnly ? undefined : onDragOver}
        onNodeClick={readOnly ? undefined : onNodeClick}
        onEdgeClick={readOnly ? undefined : onEdgeClick}
        onPaneClick={readOnly ? undefined : onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        nodesDraggable={!readOnly}
      >
        <Controls />
        <MiniMap />
        <Background gap={16} size={1} />
        
        {onExportImage && (
          <Panel position="bottom-right" className="bg-white dark:bg-gray-900 p-2 rounded shadow">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleExportImage}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Image
            </Button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default DiagramCanvas;
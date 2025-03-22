import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Toolbar = ({ onDragStart, onAddRelationship }) => {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border">
      <div className="p-3">
        <h3 className="text-sm font-medium mb-2">Add Components</h3>
        <div 
          className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 cursor-grab mb-2"
          draggable
          onDragStart={(event) => onDragStart(event, 'entity')}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
          <span className="text-sm">Entity</span>
        </div>
        
        <div 
          className="flex items-center p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 cursor-grab"
          draggable
          onDragStart={(event) => onDragStart(event, 'weak-entity')}
        >
          <div className="w-4 h-4 bg-green-500 rounded-sm border border-dashed mr-2"></div>
          <span className="text-sm">Weak Entity</span>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        className="w-full flex justify-center rounded-none border-t"
        onClick={onAddRelationship}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Relationship
      </Button>
    </div>
  );
};

export default Toolbar;
import { Pencil, Trash2, Key, Link, StarOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const AttributeList = ({ attributes = [], onEdit, onDelete }) => {
  // Group attributes by primary key
  const primaryKeys = attributes.filter(attr => attr.isPrimaryKey);
  const normalAttributes = attributes.filter(attr => !attr.isPrimaryKey);

  if (attributes.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>No attributes defined</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Primary keys */}
      {primaryKeys.length > 0 && (
        <>
          <h4 className="text-sm font-medium flex items-center">
            <Key className="h-4 w-4 mr-1" />
            Primary Keys
          </h4>
          <div className="space-y-2">
            {primaryKeys.map((attr) => (
              <AttributeItem 
                key={attr._id} 
                attribute={attr} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
          </div>
          <Separator />
        </>
      )}
      
      {/* Regular attributes */}
      <h4 className="text-sm font-medium">Attributes</h4>
      <div className="space-y-2">
        {normalAttributes.map((attr) => (
          <AttributeItem 
            key={attr._id} 
            attribute={attr} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
      </div>
    </div>
  );
};

// Individual attribute item
const AttributeItem = ({ attribute, onEdit, onDelete }) => {
  const { _id, name, dataType, isPrimaryKey, isForeignKey, isNullable, isUnique } = attribute;
  
  return (
    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors">
      <div>
        <div className="font-medium text-sm flex items-center">
          {name}
          {isForeignKey && <Link className="h-3 w-3 ml-1 text-purple-500" />}
          {isPrimaryKey && <Key className="h-3 w-3 ml-1 text-yellow-500" />}
          {isUnique && <Star className="h-3 w-3 ml-1 text-blue-500" />}
          {isNullable && <StarOff className="h-3 w-3 ml-1 text-gray-400" />}
        </div>
        <div className="text-xs text-muted-foreground">
          {dataType}
          <span className="mx-1">•</span>
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-auto">
            {isNullable ? 'Nullable' : 'Not Null'}
          </Badge>
          {isUnique && (
            <>
              <span className="mx-1">•</span>
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-auto text-blue-500 border-blue-200">
                Unique
              </Badge>
            </>
          )}
          {isForeignKey && (
            <>
              <span className="mx-1">•</span>
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-auto text-purple-500 border-purple-200">
                Foreign Key
              </Badge>
            </>
          )}
        </div>
      </div>
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onEdit(_id)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-500"
          onClick={() => onDelete(_id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default AttributeList;
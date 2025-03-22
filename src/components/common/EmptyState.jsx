import { Button } from '@/components/ui/button';
import { BookOpen, Database, FileText, FolderPlus, HelpCircle, Plus } from 'lucide-react';

const EmptyState = ({
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  icon = 'default',
  actionText,
  actionIcon,
  onAction
}) => {
  // Icon mapping
  const icons = {
    default: HelpCircle,
    document: FileText,
    folder: FolderPlus,
    database: Database,
    book: BookOpen,
  };

  // Select the icon component
  const IconComponent = icons[icon] || icons.default;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 m-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
        <IconComponent className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {description}
      </p>
      {onAction && (
        <Button onClick={onAction}>
          {actionIcon && (
            actionIcon === 'plus' ? <Plus className="h-4 w-4 mr-2" /> : actionIcon
          )}
          {actionText || 'Add New'}
        </Button>
      )}
    </div>
  );
};

export const ProjectsEmptyState = ({ onAction }) => (
  <EmptyState
    title="No projects yet"
    description="Create your first project to get started with ER diagrams."
    icon="folder"
    actionText="Create Project"
    actionIcon="plus"
    onAction={onAction}
  />
);

export const DiagramsEmptyState = ({ onAction }) => (
  <EmptyState
    title="No diagrams found"
    description="Start by creating a new diagram or importing from existing MongoDB schema."
    icon="document"
    actionText="Create Diagram"
    actionIcon="plus"
    onAction={onAction}
  />
);

export default EmptyState;
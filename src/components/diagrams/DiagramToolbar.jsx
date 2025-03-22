import React from 'react';
import { ArrowLeft, Save, Settings, Edit, Eye, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDiagram } from '@/contexts/DiagramContext';
import { useNavigate } from 'react-router-dom';

const DiagramToolbar = () => {
  const { 
    diagram, 
    project, 
    activeTab, 
    setActiveTab, 
    setSidebarMode,
    saveDiagram
  } = useDiagram();
  
  const navigate = useNavigate();
  
  return (
    <>
      {/* Top toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/projects/${project?._id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <div>
            <h1 className="text-lg font-semibold">{diagram?.name}</h1>
            <p className="text-xs text-muted-foreground">{project?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSidebarMode('settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          
          <Button 
            size="sm" 
            onClick={saveDiagram}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="diagram">
              <Edit className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              MongoDB Schema
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  );
};

export default DiagramToolbar;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { Maximize2, Minimize2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/common/ErrorMessage';
import DiagramToolbar from '@/components/diagrams/DiagramToolbar';
import DiagramCanvas from '@/components/diagrams/DiagramCanvas';
import DiagramSidebar from '@/components/diagrams/DiagramSidebar';
import { DiagramProvider, useDiagram } from '@/contexts/DiagramContext';

/**
 * Inner component that uses the DiagramContext
 */
const DiagramEditorContent = () => {
  const { loading, error } = useDiagram();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // Update fullscreen state when fullscreen is toggled via browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage 
          title="Error loading diagram" 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex">
       
      <div className="flex-1 flex flex-col relative">
        <DiagramToolbar />
        <DiagramCanvas />
        
        {/* Loading overlay */}
        {/* {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm font-medium">Loading diagram...</p>
            </div>
          </div>
        )} */}
      </div>
      <DiagramSidebar />
      {/* Fullscreen toggle button */}
      <Button
          variant="secondary"
          size="icon"
          className="absolute right-12 bottom-10 z-10 shadow-md"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </Button>
    </div>
  );
};

/**
 * Main DiagramEditor component that sets up the context
 */
const DiagramEditor = () => {
  const { id } = useParams();

  return (
    <ReactFlowProvider>
      <DiagramProvider diagramId={id}>
        <DiagramEditorContent />
      </DiagramProvider>
    </ReactFlowProvider>
  );
};

export default DiagramEditor;
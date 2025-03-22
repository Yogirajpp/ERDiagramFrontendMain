import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const CodeViewer = ({ code, onChange }) => {
  const [editedCode, setEditedCode] = useState(code);
  const [isEditing, setIsEditing] = useState(false);
  const { showSuccess } = useToast();

  // Handle code change
  const handleCodeChange = (e) => {
    setEditedCode(e.target.value);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If turning off edit mode, apply changes
      if (editedCode !== code && onChange) {
        onChange(editedCode);
      }
    } else {
      // If turning on edit mode, reset edited code to current code
      setEditedCode(code);
    }
    
    setIsEditing(!isEditing);
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    showSuccess('Copied', 'Code copied to clipboard');
  };

  // Download code as file
  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mongodb_schema.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Downloaded', 'Schema code downloaded successfully');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">MongoDB Schema</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCode}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {onChange && (
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={toggleEditMode}
            >
              {isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                'Edit Schema'
              )}
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900 rounded-md border overflow-hidden flex-1">
        {isEditing ? (
          <textarea
            value={editedCode}
            onChange={handleCodeChange}
            className="w-full h-full font-mono text-sm p-4 bg-slate-50 dark:bg-slate-900 focus:outline-none"
            spellCheck="false"
          />
        ) : (
          <pre className="w-full h-full overflow-auto p-4 font-mono text-sm">
            {code || 'No schema available. Add entities to generate schema.'}
          </pre>
        )}
      </div>
      
      {isEditing && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Warning: Editing the schema directly will regenerate your diagram based on the code.
            Existing layout positions may be affected.
          </p>
        </div>
      )}
    </div>
  );
};

export default CodeViewer;
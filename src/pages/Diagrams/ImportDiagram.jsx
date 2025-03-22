import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { diagramsAPI } from '@/lib/api';
import { LoadingOverlay } from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

const ImportDiagram = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schemaCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, schemaCode: event.target.result }));
    };
    reader.readAsText(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Diagram name is required');
      return;
    }
    
    if (!formData.schemaCode.trim()) {
      setError('Schema code is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await diagramsAPI.importSchema({
        projectId,
        name: formData.name,
        description: formData.description,
        schemaCode: formData.schemaCode
      });
      
      showSuccess(
        'Diagram imported',
        'Your new diagram has been created from the MongoDB schema'
      );
      
      // Navigate to the new diagram
      navigate(`/diagrams/${response.data.data._id}`);
    } catch (err) {
      console.error('Error importing diagram:', err);
      setError(err.response?.data?.error || 'Failed to import diagram. Please check your schema code and try again.');
      showError('Import failed', 'There was an error importing your diagram');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Button>
        
        <h1 className="text-2xl font-bold tracking-tight">Import from MongoDB Schema</h1>
        <p className="text-muted-foreground">
          Create a new ER diagram by importing an existing MongoDB schema
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage title="Error" message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <Card className="relative">
        {loading && <LoadingOverlay />}
        
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Import Details</CardTitle>
            <CardDescription>
              Enter the details for your imported diagram
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Diagram Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="My Imported Diagram"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a description of your diagram..."
                rows={2}
              />
              <p className="text-sm text-muted-foreground">
                Briefly describe the purpose and scope of this diagram
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schemaCode">MongoDB Schema Code <span className="text-red-500">*</span></Label>
              <Textarea
                id="schemaCode"
                name="schemaCode"
                value={formData.schemaCode}
                onChange={handleChange}
                placeholder="Paste your MongoDB schema code here..."
                rows={10}
                className="font-mono text-sm"
                required
              />
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Paste your existing Mongoose schema code or upload a file
                </p>
                <div>
                  <Input
                    type="file"
                    accept=".js,.ts,.json"
                    id="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Label
                    htmlFor="file"
                    className="cursor-pointer text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Upload file
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Import Schema
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ImportDiagram;
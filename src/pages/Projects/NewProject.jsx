import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { projectsAPI } from '@/lib/api';
import ErrorMessage from '@/components/common/ErrorMessage';
import { LoadingOverlay } from '@/components/common/Loading';

const NewProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gitLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Add company ID if user has one
      const projectData = {
        ...formData,
        companyId: user?.companyId || undefined
      };
      
      const response = await projectsAPI.create(projectData);
      
      showSuccess(
        'Project created',
        'Your new project has been created successfully'
      );
      
      // Navigate to the new project
      navigate(`/projects/${response.data.data._id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.error || 'Failed to create project. Please try again.');
      showError('Project creation failed', 'There was an error creating your project');
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
          onClick={() => navigate('/projects')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        
        <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground">
          Create a new project to organize your ER diagrams
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
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Enter the details for your new project
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="My ER Diagram Project"
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
                placeholder="Enter a description of your project..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Briefly describe the purpose and scope of this project
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gitLink">Git Repository URL (optional)</Label>
              <Input
                id="gitLink"
                name="gitLink"
                value={formData.gitLink}
                onChange={handleChange}
                placeholder="https://github.com/username/repository"
              />
              <p className="text-sm text-muted-foreground">
                Link to a Git repository for this project if available
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewProject;
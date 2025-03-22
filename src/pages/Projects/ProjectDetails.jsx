import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Settings, 
  Users, 
  Calendar, 
  Clock,
  Github,
  Upload,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { projectsAPI, diagramsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PageLoading } from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { DiagramsEmptyState } from '@/components/common/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [project, setProject] = useState(null);
  const [diagrams, setDiagrams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('diagrams');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newDiagramDialogOpen, setNewDiagramDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    gitLink: '',
    status: ''
  });
  const [newDiagramData, setNewDiagramData] = useState({
    name: '',
    description: ''
  });
  const [importData, setImportData] = useState({
    name: '',
    description: '',
    schemaCode: ''
  });

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await projectsAPI.getById(id);
        const project = response.data.data;
        setProject(project);
        setEditFormData({
          name: project.name,
          description: project.description || '',
          gitLink: project.gitLink || '',
          status: project.status
        });
        
        // Extract and process members
        const projectMembers = project.members || [];
        setMembers(projectMembers);
        
        // Fetch diagrams
        const diagramsResponse = await diagramsAPI.getAll(id);
        setDiagrams(diagramsResponse.data.data);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle new diagram form change
  const handleNewDiagramChange = (e) => {
    const { name, value } = e.target;
    setNewDiagramData(prev => ({ ...prev, [name]: value }));
  };

  // Handle import form change
  const handleImportChange = (e) => {
    const { name, value } = e.target;
    setImportData(prev => ({ ...prev, [name]: value }));
  };

  // Handle project update
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await projectsAPI.update(id, editFormData);
      
      // Update local project state
      setProject(prev => ({
        ...prev,
        ...editFormData
      }));
      
      setIsEditDialogOpen(false);
      showSuccess('Project updated', 'Project details have been updated successfully');
    } catch (err) {
      console.error('Error updating project:', err);
      showError('Update failed', 'Failed to update project details');
    } finally {
      setLoading(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      await projectsAPI.delete(id);
      showSuccess('Project deleted', 'Project has been successfully deleted');
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      showError('Delete failed', 'Failed to delete project');
    }
  };

  // Create new diagram
  const handleCreateDiagram = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await diagramsAPI.create({
        projectId: id,
        name: newDiagramData.name,
        description: newDiagramData.description
      });
      
      // Navigate to the new diagram
      navigate(`/diagrams/${response.data.data._id}`);
    } catch (err) {
      console.error('Error creating diagram:', err);
      showError('Creation failed', 'Failed to create new diagram');
    } finally {
      setLoading(false);
    }
  };

  // Import diagram from MongoDB schema
  const handleImportDiagram = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await diagramsAPI.importSchema({
        projectId: id,
        name: importData.name,
        description: importData.description,
        schemaCode: importData.schemaCode
      });
      
      // Navigate to the imported diagram
      navigate(`/diagrams/${response.data.data._id}`);
    } catch (err) {
      console.error('Error importing diagram:', err);
      showError('Import failed', 'Failed to import diagram from schema');
    } finally {
      setLoading(false);
    }
  };

  // Handle diagram deletion
  const handleDeleteDiagram = async (diagramId) => {
    if (!confirm('Are you sure you want to delete this diagram? This action cannot be undone.')) {
      return;
    }
    
    try {
      await diagramsAPI.delete(diagramId);
      // Update diagrams list
      setDiagrams(diagrams.filter(d => d._id !== diagramId));
      showSuccess('Diagram deleted', 'Diagram has been successfully deleted');
    } catch (err) {
      console.error('Error deleting diagram:', err);
      showError('Delete failed', 'Failed to delete diagram');
    }
  };

  // Determine user permissions
  const isAdmin = user && (
    project?.maintainerId === user._id || 
    members.some(m => m.userId === user._id && m.role === 'admin')
  );

  if (loading && !project) {
    return <PageLoading />;
  }

  if (error && !project) {
    return (
      <div className="p-6">
        <ErrorMessage 
          title="Error loading project" 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/projects')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          
          <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
          <p className="text-muted-foreground">{project?.description || 'No description provided'}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button onClick={() => setNewDiagramDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Diagram
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Diagram
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  onClick={handleDeleteProject}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`text-sm font-medium mt-1 px-2 py-1 rounded-full w-fit
                ${project?.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                ${project?.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                ${project?.status === 'archived' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' : ''}
              `}>
                {project?.status?.charAt(0).toUpperCase() + project?.status?.slice(1)}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {project?.updatedAt ? formatDate(project.updatedAt) : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Created On</span>
              <span className="text-sm font-medium mt-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {project?.createdAt ? formatDate(project.createdAt) : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Members</span>
              <span className="text-sm font-medium mt-1 flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {members?.length || 1}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repository link if available */}
      {project?.gitLink && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Github className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium">{project.gitLink}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open(project.gitLink, '_blank')}
          >
            View Repository
          </Button>
        </div>
      )}

      {/* Tabs for Diagrams and Members */}
      <Tabs defaultValue="diagrams" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="diagrams">
            <FileText className="h-4 w-4 mr-2" />
            Diagrams
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagrams" className="mt-4">
          {diagrams.length === 0 ? (
            <DiagramsEmptyState onAction={() => setNewDiagramDialogOpen(true)} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {diagrams.map((diagram) => (
                <Card key={diagram._id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{diagram.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {diagram.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between items-center">
                        <span>Created:</span>
                        <span>{formatDate(diagram.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Updated:</span>
                        <span>{formatDate(diagram.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Entities:</span>
                        <span>{diagram.entities?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4">
                    <Button 
                      onClick={() => navigate(`/diagrams/${diagram._id}`)}
                      className="flex-1 mr-2"
                    >
                      Open
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/diagrams/${diagram._id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          // Generate MongoDB Schema
                          diagramsAPI.generateSchema(diagram._id)
                            .then(res => {
                              // Navigate to edit with schema tab
                              navigate(`/diagrams/${diagram._id}?tab=code`);
                            })
                            .catch(err => {
                              showError('Error', 'Failed to generate schema');
                            });
                        }}>
                          <Download className="mr-2 h-4 w-4" />
                          Generate Schema
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                          onClick={() => handleDeleteDiagram(diagram._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                People with access to this project and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Project owner */}
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
                      {project?.maintainerId?.name?.charAt(0) || 'O'}
                    </div>
                    <div>
                      <p className="font-medium">{project?.maintainerId?.name || 'Project Owner'}</p>
                      <p className="text-xs text-muted-foreground">{project?.maintainerId?.email || 'No email available'}</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                    Owner
                  </div>
                </div>
                
                {/* Members */}
                {members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.userId?._id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold mr-3">
                          {member.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{member.userId?.name || 'Team Member'}</p>
                          <p className="text-xs text-muted-foreground">{member.userId?.email || 'No email available'}</p>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-md">
                        {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    No additional members in this project
                  </div>
                )}
              </div>
            </CardContent>
            {isAdmin && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Team Members
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProject}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gitLink">Git Repository URL</Label>
                <Input
                  id="gitLink"
                  name="gitLink"
                  value={editFormData.gitLink}
                  onChange={handleEditChange}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Diagram Dialog */}
      <Dialog open={newDiagramDialogOpen} onOpenChange={setNewDiagramDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Diagram</DialogTitle>
            <DialogDescription>
              Enter details for your new ER diagram
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDiagram}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="diagramName">Diagram Name</Label>
                <Input
                  id="diagramName"
                  name="name"
                  value={newDiagramData.name}
                  onChange={handleNewDiagramChange}
                  placeholder="My ER Diagram"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagramDescription">Description (optional)</Label>
                <Textarea
                  id="diagramDescription"
                  name="description"
                  value={newDiagramData.description}
                  onChange={handleNewDiagramChange}
                  placeholder="Describe the purpose of this diagram"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewDiagramDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Diagram</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Schema Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import from MongoDB Schema</DialogTitle>
            <DialogDescription>
              Create a new diagram by importing an existing MongoDB schema
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportDiagram}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="importName">Diagram Name</Label>
                <Input
                  id="importName"
                  name="name"
                  value={importData.name}
                  onChange={handleImportChange}
                  placeholder="My Imported Diagram"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="importDescription">Description (optional)</Label>
                <Input
                  id="importDescription"
                  name="description"
                  value={importData.description}
                  onChange={handleImportChange}
                  placeholder="Diagram imported from MongoDB schema"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schemaCode">MongoDB Schema Code</Label>
                <Textarea
                  id="schemaCode"
                  name="schemaCode"
                  value={importData.schemaCode}
                  onChange={handleImportChange}
                  placeholder="Paste your MongoDB schema code here..."
                  rows={8}
                  required
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Paste your existing Mongoose schema code. The system will analyze it and create entities and relationships automatically.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Import Schema</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;
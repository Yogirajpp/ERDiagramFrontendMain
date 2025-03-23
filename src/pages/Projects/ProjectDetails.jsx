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
  Download,
  BarChart,
  ExternalLink,
  Sparkles,
  Search,
  AlertCircle
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { projectsAPI, diagramsAPI } from '@/lib/api';
import { formatDate, formatDistanceToNow } from '@/lib/utils';
import { PageLoading } from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { DiagramsEmptyState } from '@/components/common/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * ProjectDetails Component
 * 
 * This component displays comprehensive information about a project, 
 * including metadata, diagrams, and team members. It provides functionality
 * for managing diagrams, editing project details, and team collaboration.
 */
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
  const [searchQuery, setSearchQuery] = useState('');
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
  const [isActionLoading, setIsActionLoading] = useState(false);

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
      setIsActionLoading(true);
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
      setIsActionLoading(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsActionLoading(true);
      await projectsAPI.delete(id);
      showSuccess('Project deleted', 'Project has been successfully deleted');
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      showError('Delete failed', 'Failed to delete project');
      setIsActionLoading(false);
    }
  };

  // Create new diagram
  const handleCreateDiagram = async (e) => {
    e.preventDefault();
    
    try {
      setIsActionLoading(true);
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
      setIsActionLoading(false);
    }
  };

  // Import diagram from MongoDB schema
  const handleImportDiagram = async (e) => {
    e.preventDefault();
    
    try {
      setIsActionLoading(true);
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
      setIsActionLoading(false);
    }
  };

  // Handle diagram deletion
  const handleDeleteDiagram = async (diagramId, diagramName) => {
    if (!confirm(`Are you sure you want to delete "${diagramName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsActionLoading(true);
      await diagramsAPI.delete(diagramId);
      // Update diagrams list
      setDiagrams(diagrams.filter(d => d._id !== diagramId));
      showSuccess('Diagram deleted', 'Diagram has been successfully deleted');
    } catch (err) {
      console.error('Error deleting diagram:', err);
      showError('Delete failed', 'Failed to delete diagram');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Filter diagrams based on search query
  const filteredDiagrams = diagrams.filter(diagram => 
    diagram.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (diagram.description && diagram.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Determine user permissions
  const isAdmin = user && (
    project?.maintainerId === user._id || 
    members.some(m => m.userId === user._id && m.role === 'admin')
  );

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700 whitespace-nowrap">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 whitespace-nowrap">Completed</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700 whitespace-nowrap">Archived</Badge>;
      default:
        return <Badge variant="outline">{status?.charAt(0).toUpperCase() + status?.slice(1)}</Badge>;
    }
  };

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <PageLoading />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorMessage 
          title="Error loading project" 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-12">
        {/* Project header */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/projects')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            {project?.status && getStatusBadge(project.status)}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{project?.name}</h1>
              <p className="text-muted-foreground max-w-2xl">{project?.description || <span className="italic text-gray-400">No description provided</span>}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setNewDiagramDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Diagram
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create a new ER diagram</TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import from Schema
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('members')}>
                    <Users className="mr-2 h-4 w-4" />
                    View Team
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
        </div>

        {/* Project metadata cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-muted bg-card/50 hover:bg-card/80 transition-colors duration-200">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">
                  {project?.status?.charAt(0).toUpperCase() + project?.status?.slice(1) || 'N/A'}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center
                ${project?.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                ${project?.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                ${project?.status === 'archived' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' : ''}
              `}>
                <BarChart className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-muted bg-card/50 hover:bg-card/80 transition-colors duration-200">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-lg font-semibold">
                  {project?.updatedAt ? formatDistanceToNow(new Date(project.updatedAt)) : 'N/A'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-muted bg-card/50 hover:bg-card/80 transition-colors duration-200">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-lg font-semibold">
                  {project?.createdAt ? formatDistanceToNow(new Date(project.createdAt)) : 'N/A'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-muted bg-card/50 hover:bg-card/80 transition-colors duration-200">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="text-lg font-semibold">
                  {members?.length || 1} {(members?.length || 1) === 1 ? 'member' : 'members'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repository link */}
        {project?.gitLink && (
          <Card className="border border-muted overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-l-4 border-indigo-500">
                <div className="flex items-center overflow-hidden">
                  <Github className="h-5 w-5 flex-shrink-0 mr-3 text-muted-foreground" />
                  <p className="text-sm font-medium truncate">{project.gitLink}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(project.gitLink, '_blank')}
                      className="ml-4 flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Repository</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Open repository in new tab</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Diagrams and Members */}
        <Tabs defaultValue="diagrams" value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <div className="flex justify-between items-center border-b">
            <TabsList className="h-10">
              <TabsTrigger value="diagrams" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">
                <FileText className="h-4 w-4 mr-2" />
                Diagrams
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">
                <Users className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
            </TabsList>
            
            {activeTab === 'diagrams' && diagrams.length > 0 && (
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search diagrams..."
                  className="pl-9 w-[200px] h-9"
                />
              </div>
            )}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="diagrams" className="mt-6">
              {diagrams.length === 0 ? (
                <div className="py-8">
                  <DiagramsEmptyState onAction={() => setNewDiagramDialogOpen(true)} />
                </div>
              ) : (
                <>
                  {searchQuery && filteredDiagrams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No matching diagrams</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        No diagrams match your search for "{searchQuery}". Try using different keywords or create a new diagram.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => setSearchQuery('')}
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredDiagrams.map((diagram) => (
                        <Card 
                          key={diagram._id} 
                          className="overflow-hidden hover:shadow-md transition-shadow duration-200 border border-muted/60 group"
                        >
                          <CardHeader className="pb-3 relative">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                      <circle cx="12" cy="12" r="1"></circle>
                                      <circle cx="12" cy="5" r="1"></circle>
                                      <circle cx="12" cy="19" r="1"></circle>
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => navigate(`/diagrams/${diagram._id}`)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Diagram
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setIsActionLoading(true);
                                    diagramsAPI.generateSchema(diagram._id)
                                      .then(res => {
                                        navigate(`/diagrams/${diagram._id}?tab=code`);
                                      })
                                      .catch(err => {
                                        setIsActionLoading(false);
                                        showError('Error', 'Failed to generate schema');
                                      });
                                  }}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Generate Schema
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                    onClick={() => handleDeleteDiagram(diagram._id, diagram.name)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Diagram
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{diagram.name}</CardTitle>
                              </div>
                            </div>
                            
                            <CardDescription className="line-clamp-2 mt-2">
                              {diagram.description || <span className="italic">No description</span>}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="pb-3">
                            <div className="bg-muted/30 dark:bg-muted/10 rounded-md p-3 text-xs text-muted-foreground space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span>Created:</span>
                                <span className="font-medium">{formatDate(diagram.createdAt)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Updated:</span>
                                <span className="font-medium">{formatDate(diagram.updatedAt)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Entities:</span>
                                <span className="font-medium">{diagram.entities?.length || 0}</span>
                              </div>
                            </div>
                          </CardContent>
                          
                          <div className="px-6 pb-6">
                            <Button 
                              onClick={() => navigate(`/diagrams/${diagram._id}`)}
                              className="w-full"
                            >
                              Open Diagram
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="members" className="mt-6">
              <Card>
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
                  <CardFooter className="pt-2 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        // Add team member functionality would go here
                        showSuccess('Coming soon', 'Team management will be available soon');
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Invite Team Members
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </motion.div>
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
                    placeholder="Enter project name"
                    className="focus-visible:ring-primary"
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
                    placeholder="Describe your project purpose"
                    className="focus-visible:ring-primary resize-none"
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
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
                <Button type="submit" disabled={isActionLoading}>
                  {isActionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
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
                    className="focus-visible:ring-primary"
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
                    className="focus-visible:ring-primary resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewDiagramDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isActionLoading}>
                  {isActionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Diagram
                    </>
                  )}
                </Button>
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
                    className="focus-visible:ring-primary"
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
                    className="focus-visible:ring-primary"
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
                    className="font-mono text-sm focus-visible:ring-primary"
                  />
                  <Alert variant="outline" className="mt-2 bg-muted/50 text-sm">
                    <AlertDescription>
                      The system will analyze your Mongoose schema code and automatically create entities and relationships.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isActionLoading}>
                  {isActionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : "Import Schema"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ProjectDetails;
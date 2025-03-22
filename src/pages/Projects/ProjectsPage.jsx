import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FolderOpen, 
  Trash2, 
  Edit, 
  Calendar, 
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { projectsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PageLoading } from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ProjectsEmptyState } from '@/components/common/EmptyState';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsAPI.getAll();
        setProjects(response.data.data);
        setFilteredProjects(response.data.data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle search and filter
  useEffect(() => {
    let result = [...projects];
    
    // Apply search
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(project => 
        project.name.toLowerCase().includes(lowerCaseQuery) || 
        (project.description && project.description.toLowerCase().includes(lowerCaseQuery))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(project => project.status === filterStatus);
    }
    
    setFilteredProjects(result);
  }, [searchQuery, filterStatus, projects]);

  // Handle project deletion
  const handleDeleteProject = async (projectId) => {
    try {
      await projectsAPI.delete(projectId);
      setProjects(projects.filter(project => project._id !== projectId));
      showSuccess('Project deleted', 'Project has been successfully deleted');
    } catch (err) {
      console.error('Error deleting project:', err);
      showError('Delete failed', 'Failed to delete project. Please try again.');
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your ER diagram projects
          </p>
        </div>
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {error && (
        <ErrorMessage 
          title="Failed to load projects" 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      )}

      {!loading && projects.length === 0 ? (
        <ProjectsEmptyState onAction={() => navigate('/projects/new')} />
      ) : (
        <>
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('archived')}>
                  Archived
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Projects grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Card key={project._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>{formatDate(project.updatedAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        <span>{project.members?.length || 1} members</span>
                      </div>
                      <div className="flex items-center col-span-2">
                        <FolderOpen className="mr-1 h-4 w-4" />
                        <span>{project.diagrams?.length || 0} diagrams</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center">
                      <span className={`
                        text-xs px-2 py-1 rounded-full 
                        ${project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${project.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${project.status === 'archived' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' : ''}
                      `}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-6">
                    <Link to={`/projects/${project._id}`} className="flex-1 mr-2">
                      <Button variant="default" className="w-full">
                        View
                      </Button>
                    </Link>
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
                        <DropdownMenuItem onClick={() => navigate(`/projects/${project._id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                          onClick={() => handleDeleteProject(project._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-muted/50 rounded-lg border border-dashed p-8 text-center">
                  <h3 className="font-medium mb-2">No projects found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    No projects match your search criteria. Try adjusting your filters.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsPage;
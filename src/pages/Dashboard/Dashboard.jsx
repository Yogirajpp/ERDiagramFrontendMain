import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, FolderOpen, Plus, Users, Activity, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { projectsAPI, diagramsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Loading, { PageLoading } from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentDiagrams, setRecentDiagrams] = useState([]);
  const [stats, setStats] = useState({
    projectCount: 0,
    diagramCount: 0,
    teamMembers: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects
        const projectsResponse = await projectsAPI.getAll();
        const projects = projectsResponse.data.data || [];
        
        // Sort projects by updated date
        const sortedProjects = [...projects].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        setRecentProjects(sortedProjects.slice(0, 3));
        
        // Calculate statistics
        setStats({
          projectCount: projects.length,
          diagramCount: projects.reduce((count, project) => count + (project.diagrams?.length || 0), 0),
          teamMembers: new Set(projects.flatMap(p => p.members.map(m => m.userId))).size,
          activeProjects: projects.filter(p => p.status === 'active').length,
        });
        
        // Get recent diagrams from the first few projects
        const diagramsPromises = sortedProjects.slice(0, 2).map(project => 
          diagramsAPI.getAll(project._id)
            .then(res => res.data.data.map(diagram => ({
              ...diagram,
              projectName: project.name
            })))
            .catch(() => [])
        );
        
        const diagramsResults = await Promise.all(diagramsPromises);
        const allDiagrams = diagramsResults.flat();
        
        // Sort diagrams by updated date
        const sortedDiagrams = allDiagrams.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        setRecentDiagrams(sortedDiagrams.slice(0, 4));
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your projects and activities.
        </p>
      </div>

      {error && (
        <ErrorMessage 
          title="Failed to load dashboard" 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Projects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} active projects
            </p>
          </CardContent>
        </Card>

        {/* Diagrams Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ER Diagrams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.diagramCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Contributing to your projects
            </p>
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentProjects[0]?.updatedAt ? (
                formatDate(recentProjects[0].updatedAt)
              ) : (
                'No activity'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {recentProjects[0]?.name ? `In ${recentProjects[0].name}` : 'Create your first project'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent Projects</h2>
          <Button onClick={() => navigate('/projects/new')} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Project
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <Card key={project._id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(project.updatedAt)}
                    </div>
                    <div className="flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      {project.diagrams?.length || 0} diagrams
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 p-4">
                  <Link to={`/projects/${project._id}`} className="w-full">
                    <Button variant="secondary" className="w-full">View Project</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border-dashed bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No projects yet</h3>
                  <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
                    Create your first project to get started with ER diagrams
                  </p>
                  <Button onClick={() => navigate('/projects/new')}>
                    <Plus className="mr-1 h-4 w-4" />
                    Create Project
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Recent ER Diagrams */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent ER Diagrams</h2>
          <Button 
            onClick={() => navigate(recentProjects.length > 0 ? `/projects/${recentProjects[0]._id}` : '/projects/new')} 
            size="sm"
            variant="outline"
          >
            View All
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recentDiagrams.length > 0 ? (
            recentDiagrams.map((diagram) => (
              <Card key={diagram._id}>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{diagram.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {diagram.projectName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Updated {formatDate(diagram.updatedAt)}
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <Link to={`/diagrams/${diagram._id}`} className="w-full">
                    <Button variant="secondary" size="sm" className="w-full">Open</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border-dashed bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No diagrams yet</h3>
                  <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
                    Start by creating a new diagram in one of your projects
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(recentProjects.length > 0 ? `/projects/${recentProjects[0]._id}` : '/projects/new')}
                  >
                    Browse Projects
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
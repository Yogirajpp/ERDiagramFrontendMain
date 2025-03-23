import { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, FolderOpen, Plus, Users, Activity, Calendar, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { projectsAPI, diagramsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Loading, { PageLoading } from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

// Memoized card components for better performance
const StatCard = memo(({ title, value, subtitle, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
));

const ProjectCard = memo(({ project }) => (
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
));

const DiagramCard = memo(({ diagram }) => (
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
));

const EmptyState = memo(({ type, icon: Icon, title, description, actionText, onAction }) => (
  <div className="col-span-full">
    <Card className="border-dashed bg-muted/50">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
          {description}
        </p>
        <Button 
          variant={type === 'projects' ? 'default' : 'outline'} 
          onClick={onAction}
        >
          {type === 'projects' && <Plus className="mr-1 h-4 w-4" />}
          {actionText}
        </Button>
      </CardContent>
    </Card>
  </div>
));

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Fetch projects with error handling and timeout
      const projectsPromise = Promise.race([
        projectsAPI.getAll(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout: Failed to fetch projects')), 15000)
        )
      ]);
      
      const projectsResponse = await projectsPromise;
      const projects = projectsResponse?.data?.data || [];
      
      // Sort projects by updated date
      const sortedProjects = [...projects].sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      
      setRecentProjects(sortedProjects.slice(0, 3));
      
      // Calculate statistics
      const uniqueMembers = new Set();
      projects.forEach(project => {
        project.members?.forEach(member => {
          if (member.userId) uniqueMembers.add(member.userId);
        });
      });
      
      setStats({
        projectCount: projects.length,
        diagramCount: projects.reduce((count, project) => count + (project.diagrams?.length || 0), 0),
        teamMembers: uniqueMembers.size,
        activeProjects: projects.filter(p => p.status === 'active').length,
      });
      
      // Get recent diagrams from the first few projects
      if (sortedProjects.length > 0) {
        const diagramsPromises = sortedProjects.slice(0, 2).map(project => 
          diagramsAPI.getAll(project._id)
            .then(res => (res.data.data || []).map(diagram => ({
              ...diagram,
              projectName: project.name
            })))
            .catch(err => {
              console.error(`Error fetching diagrams for project ${project._id}:`, err);
              return [];
            })
        );
        
        const diagramsResults = await Promise.allSettled(diagramsPromises);
        const allDiagrams = diagramsResults
          .filter(result => result.status === 'fulfilled')
          .flatMap(result => result.value);
        
        // Sort diagrams by updated date
        const sortedDiagrams = allDiagrams.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        setRecentDiagrams(sortedDiagrams.slice(0, 4));
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Optional: Set up auto-refresh interval
    // const refreshInterval = setInterval(() => fetchDashboardData(true), 5 * 60 * 1000); // Refresh every 5 minutes
    // return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  if (loading) {
    return <PageLoading />;
  }

  const handleCreateProject = () => navigate('/projects/new');
  const handleViewAllDiagrams = () => navigate(recentProjects.length > 0 ? `/projects/${recentProjects[0]._id}` : '/projects/new');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'User'}! Here's an overview of your projects and activities.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchDashboardData(true)} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <ErrorMessage 
          title="Failed to load dashboard" 
          message={error} 
          onRetry={() => fetchDashboardData()}
        />
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Projects" 
          value={stats.projectCount} 
          subtitle={`${stats.activeProjects} active projects`} 
          icon={FolderOpen} 
        />
        <StatCard 
          title="ER Diagrams" 
          value={stats.diagramCount} 
          subtitle="Across all projects" 
          icon={FileText} 
        />
        <StatCard 
          title="Team Members" 
          value={stats.teamMembers} 
          subtitle="Contributing to your projects" 
          icon={Users} 
        />
        <StatCard 
          title="Last Activity" 
          value={recentProjects[0]?.updatedAt ? formatDate(recentProjects[0].updatedAt) : 'No activity'} 
          subtitle={recentProjects[0]?.name ? `In ${recentProjects[0].name}` : 'Create your first project'} 
          icon={Activity} 
        />
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent Projects</h2>
          <Button onClick={handleCreateProject} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Project
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))
          ) : (
            <EmptyState 
              type="projects"
              icon={FolderOpen}
              title="No projects yet"
              description="Create your first project to get started with ER diagrams"
              actionText="Create Project"
              onAction={handleCreateProject}
            />
          )}
        </div>
      </div>

      {/* Recent ER Diagrams */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent ER Diagrams</h2>
          <Button 
            onClick={handleViewAllDiagrams}
            size="sm"
            variant="outline"
          >
            View All
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recentDiagrams.length > 0 ? (
            recentDiagrams.map((diagram) => (
              <DiagramCard key={diagram._id} diagram={diagram} />
            ))
          ) : (
            <EmptyState 
              type="diagrams"
              icon={FileText}
              title="No diagrams yet"
              description="Start by creating a new diagram in one of your projects"
              actionText="Browse Projects"
              onAction={handleViewAllDiagrams}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
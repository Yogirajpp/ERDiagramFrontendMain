import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  FileText, 
  Trash2, 
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import { diagramsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PageLoading } from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';
import { DiagramsEmptyState } from '@/components/common/EmptyState';

const DiagramList = ({ projectId }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [diagrams, setDiagrams] = useState([]);
  const [filteredDiagrams, setFilteredDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch diagrams
  useEffect(() => {
    const fetchDiagrams = async () => {
      try {
        setLoading(true);
        const response = await diagramsAPI.getAll(projectId);
        setDiagrams(response.data.data);
        setFilteredDiagrams(response.data.data);
      } catch (err) {
        console.error('Error fetching diagrams:', err);
        setError('Failed to load diagrams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiagrams();
  }, [projectId]);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = diagrams.filter(diagram => 
        diagram.name.toLowerCase().includes(query) || 
        (diagram.description && diagram.description.toLowerCase().includes(query))
      );
      setFilteredDiagrams(filtered);
    } else {
      setFilteredDiagrams(diagrams);
    }
  }, [searchQuery, diagrams]);

  // Handle diagram deletion
  const handleDeleteDiagram = async (diagramId) => {
    if (!confirm('Are you sure you want to delete this diagram? This action cannot be undone.')) {
      return;
    }
    
    try {
      await diagramsAPI.delete(diagramId);
      setDiagrams(diagrams.filter(diagram => diagram._id !== diagramId));
      showSuccess('Diagram deleted', 'Diagram has been successfully deleted');
    } catch (err) {
      console.error('Error deleting diagram:', err);
      showError('Delete failed', 'Failed to delete diagram. Please try again.');
    }
  };

  // Handle schema download
  const handleDownloadSchema = async (diagramId, diagramName) => {
    try {
      const response = await diagramsAPI.generateSchema(diagramId);
      const schemaCode = response.data.data.schemaCode;
      
      // Create a blob and download
      const blob = new Blob([schemaCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${diagramName || 'diagram'}_schema.js`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Schema downloaded', 'MongoDB schema has been downloaded successfully');
    } catch (err) {
      console.error('Error downloading schema:', err);
      showError('Download failed', 'Failed to download schema. Please try again.');
    }
  };

  // Create new diagram
  const createNewDiagram = () => {
    // Redirect to the project details page where the user can create a diagram
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <div>
          <h1 className="text-2xl font-bold tracking-tight">ER Diagrams</h1>
          <p className="text-muted-foreground">
            Manage your entity-relationship diagrams
          </p>
        </div>
        <Button onClick={createNewDiagram}>
          <Plus className="mr-2 h-4 w-4" /> New Diagram
        </Button>
      </div>

      {error && (
        <ErrorMessage 
          title="Failed to load diagrams" 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      )}

      {!loading && diagrams.length === 0 ? (
        <DiagramsEmptyState onAction={createNewDiagram} />
      ) : (
        <>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search diagrams..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Diagrams grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDiagrams.length > 0 ? (
              filteredDiagrams.map((diagram) => (
                <Card key={diagram._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>{diagram.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {diagram.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>Created: {formatDate(diagram.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>Updated: {formatDate(diagram.updatedAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="mr-1 h-4 w-4" />
                        <span>Entities: {diagram.entities?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-6">
                    <Link to={`/diagrams/${diagram._id}`} className="flex-1 mr-2">
                      <Button variant="default" className="w-full">
                        Open
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
                        <DropdownMenuItem onClick={() => handleDownloadSchema(diagram._id, diagram.name)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download Schema
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
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-muted/50 rounded-lg border border-dashed p-8 text-center">
                  <h3 className="font-medium mb-2">No diagrams found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    No diagrams match your search criteria.
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
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

export default DiagramList;
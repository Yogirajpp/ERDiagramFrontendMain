import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb'; // Import the required components from ShadCN
import { Link, useLocation } from 'react-router-dom';

const BreadcrumbComponent = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter((x) => x); // Get path segments

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      {paths.map((path, index) => {
        const to = `/${paths.slice(0, index + 1).join('/')}`; // Build the path
        return (
          <BreadcrumbItem key={to}>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbLink as={Link} to={to}>
              {path.charAt(0).toUpperCase() + path.slice(1)} {/* Capitalize first letter */}
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;

import { Link } from 'react-router-dom';
import { Bot, BookOpen, SquareTerminal, Settings2, Frame, PieChart, Map } from "lucide-react";
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useState } from 'react';

const data = {
  teams: [
    {
      name: "Learnhattan",
      plan: "Student",
    },
    {
      name: "Learnhattan",
      plan: "Contributor",
    },
  ],
  navMain: [
    { title: "Dashboard", url: "/", icon: SquareTerminal },
    { title: "Spaces", url: "/spaces", icon: Bot },
    { title: "Courses", url: "/courses", icon: BookOpen },
    { title: "Settings", url: "/settings", icon: Settings2 },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ],
};

const SidebarComponent = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to toggle the sidebar state
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarInset>
        <header className="flex h-16 items-center justify-between transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4">
          {/* Conditionally render h1 based on isCollapsed state */}
          {!isCollapsed && 
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                Learnhattan
              </span>
              <span className="truncate text-xs">
                Student
              </span>
            </div>
          }
          
          <div className="flex items-center gap-2">
            {!isCollapsed && <Separator orientation="vertical" className="mr-2 h-4" />}
            <SidebarTrigger className="-ml-1" onClick={toggleSidebar} />
          </div>
        </header>
        
        <SidebarHeader>
          {/* Platform Section */}
          <h2 className={`px-2 py-2 text-2md ${isCollapsed ? 'hidden' : 'block'}`}>Platform</h2>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link to={item.url}>
                  <SidebarMenuButton className="flex items-center text-md h-8"> {/* Increased text size */}
                    {item.icon && <div className="w-5 h-5 mr-3"> {/* Increased icon size */}
                      <item.icon />
                    </div>}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* Projects Section */}
          <h2 className={`px-2 py-2 text-2md ${isCollapsed ? 'hidden' : 'block'}`}>Projects</h2>
          <SidebarMenu>
            {data.projects.map((project) => (
              <SidebarMenuItem key={project.name}>
                <Link to={project.url}>
                  <SidebarMenuButton className="flex items-center text-md h-8"> {/* Increased text size */}
                    {project.icon && <div className="justify-center w-5 h-5 mr-3"> {/* Increased icon size */}
                      <project.icon />
                    </div>}
                    <span>{project.name}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarHeader>
      </SidebarInset>
    </Sidebar>
  );
};

export default SidebarComponent;

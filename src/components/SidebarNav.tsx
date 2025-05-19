
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dashboard, Users } from "lucide-react";

// Define the module mapping
const ROLE_MODULES = {
  "1": {
    modules: [
      { moduleId: 1, name: "Dashboard", icon: Dashboard, path: "/admin/dashboard" },
      { moduleId: 2, name: "Workspaces", icon: null, path: "/dashboard" },
      { moduleId: 3, name: "User Management", icon: Users, path: "/admin/users" },
    ]
  },
  "2": {
    modules: [
      { moduleId: 2, name: "Workspaces", icon: null, path: "/dashboard" },
    ]
  }
};

const SidebarNav = () => {
  const { userRole } = useAuth();
  
  const modules = ROLE_MODULES[userRole.toString()]?.modules || ROLE_MODULES["2"].modules;
  
  // Only render modules 1 and 3 as buttons (Dashboard and User Management)
  // Workspace module (2) is already handled by the existing sidebar
  return (
    <div className="flex flex-col space-y-2 p-2">
      {modules.map(module => {
        // Skip Workspaces module as it's already handled by the sidebar component
        if (module.moduleId === 2) return null;
        
        return (
          <Button 
            key={module.moduleId}
            variant="ghost"
            className="w-full justify-start text-gray-200"
            asChild
          >
            <Link to={module.path} className="flex items-center gap-2">
              {module.icon && <module.icon className="h-4 w-4" />}
              <span>{module.name}</span>
            </Link>
          </Button>
        );
      })}
    </div>
  );
};

export default SidebarNav;


import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: '📊 Dashboard', path: '/' },
    { label: '📁 Projetos', path: '/projects' },
    { label: '📈 Analytics', path: '/analytics' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center px-6">
        <div className="mr-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            🚀 Agile Canvas Suite
          </h1>
        </div>
        
        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              onClick={() => navigate(item.path)}
              className={`text-sm font-medium transition-all ${
                location.pathname === item.path 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}

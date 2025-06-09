
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: '🏠 Início', path: '/projects' },
    { label: '📊 Dashboard', path: '/' },
    { label: '📈 Analytics', path: '/analytics' }
  ];

  return (
    <header className="bg-blue-600 text-white px-6 py-3">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl">
            GP
          </div>
          <h1 className="text-xl font-bold">Gerência de Projetos</h1>
        </div>
        
        <nav className="flex items-center space-x-6">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={`text-white hover:bg-white/20 ${
                location.pathname === item.path 
                  ? "bg-white/20" 
                  : ""
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

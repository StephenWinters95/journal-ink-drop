import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/budget-dashboard" },
    { name: "Journal", path: "/journal" },
    { name: "My Learning", path: "/learning" },
    { name: "Run My Numbers", path: "/budget-calendar" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-teal-500 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-500 rounded flex items-center justify-center">
              <span className="text-white font-bold">€</span>
            </div>
            <span className="text-xl font-semibold">Financial Literacy</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-white hover:text-teal-100 transition-colors duration-200 ${
                  isActive(item.path) ? "font-semibold border-b-2 border-white" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Account Button */}
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            Account
          </Button>
        </div>
      </div>
    </nav>
  );
};
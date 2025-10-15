import { Home, LogOut, Wallet, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { clearToken } from "@/lib/api";

const Sidebar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = () => {
    clearToken();
    navigate("/auth");
  };

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/transactions", icon: Wallet, label: "Transactions" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 glass-card border border-border/50 hover:bg-primary/10"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen glass-card border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out z-40 ${
          isMobile
            ? isOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-64"
            : "w-64"
        } p-6`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold gradient-text">BudgetFlow</h1>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <Button
          variant="outline"
          onClick={handleSignOut}
          className={`w-full justify-start gap-3 mt-auto border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive px-4`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Sign Out</span>
        </Button>
      </aside>
    </>
  );
};

export default Sidebar;

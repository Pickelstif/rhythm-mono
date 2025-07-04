import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import logoLight from "@/assets/logo_light.png";
import logoDark from "@/assets/logo_dark.png";

const Header = () => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  
  const getUserInitial = () => {
    if (!user) return "U";
    
    // Try to get name from user metadata if available
    const userMetadata = user.user_metadata;
    if (userMetadata && userMetadata.name) {
      return userMetadata.name.charAt(0).toUpperCase();
    }
    
    // Fallback to email
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <header className="border-b border-border bg-red-50/80 dark:bg-red-950/20 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={theme === 'dark' ? logoDark : logoLight} 
            alt="RhythmSync Logo" 
            className="h-8 w-auto" 
          />
          <Link to="/dashboard" className="text-xl font-bold">
            RhythmSync
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name || user?.email} />
                  <AvatarFallback className="bg-rhythm-500">
                    {getUserInitial()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;

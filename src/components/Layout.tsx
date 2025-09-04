import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Bell } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigationItems = isAdmin ? [
    { name: 'ዳሽቦርድ', path: '/admin', icon: '📊' },
    { name: 'ሽፋን ጠያቂ', path: '/admin/requests', icon: '📝' },
    { name: 'ጽህፈት ቤቶች', path: '/admin/users', icon: '👥' },
    { name: 'አዲስ ጽህፈት ቤት', path: '/admin/create-user', icon: '➕' },
  ] : [
    { name: 'የሚድያ ሽፋን ጠይቅ', path: '/request', icon: '📝' },
    { name: 'ታሪክ', path: '/history', icon: '📚' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/69e823ba-1d77-4469-ad68-c01b1a28cf2b.png" 
                alt="Logo" 
                className="h-10 w-10"
              />
              <h1 className="text-xl font-bold text-primary-foreground">
                የሚድያ ሽፋን አስተዳደር
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`text-primary-foreground hover:text-primary-glow transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path ? 'bg-primary-glow/20' : ''
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-4">
                <span className="text-primary-foreground text-sm">
                  {profile?.office_name}
                </span>
                {isAdmin && (
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-glow/20">
                    <Bell className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-primary-foreground hover:bg-primary-glow/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                ውጣ
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-primary-foreground hover:bg-primary-glow/20"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-primary border-t border-primary-glow/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-primary-foreground hover:bg-primary-glow/20 block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                    location.pathname === item.path ? 'bg-primary-glow/20' : ''
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Bell, X, Home, FileText, Users, BarChart3, Plus, History } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut, isAdmin } = useAuth();
  const { pendingCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Re-added for mobile slide-out sidebar
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navigationItems = isAdmin ? [
    { name: 'ዳሽቦርድ', path: '/admin', icon: BarChart3, description: 'ዋና ዳሽቦርድ' },
    { name: 'ሽፋን ጠያቂ', path: '/admin/requests', icon: FileText, description: 'ጥያቄዎችን አስተዳደር', badge: pendingCount },
    { name: 'ጽህፈት ቤቶች', path: '/admin/users', icon: Users, description: 'ጽህፈት ቤቶችን አስተዳደር' },
    { name: 'አዲስ ጽህፈት ቤት', path: '/admin/create-user', icon: Plus, description: 'አዲስ ጽህፈት ቤት ይጨመሩ' },
  ] : [
    { name: 'ዳሽቦርድ', path: '/dashboard', icon: Home, description: 'ዋና ዳሽቦርድ' },
    { name: 'የሚድያ ሽፋን ጠይቅ', path: '/request', icon: FileText, description: 'አዲስ ጥያቄ ይጨመሩ' },
    { name: 'ታሪክ', path: '/history', icon: History, description: 'የቀድሞ ጥያቄዎች' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* PWA Banner Spacer - adds space when banner is visible */}
      <div id="pwa-banner-spacer" className="h-0 transition-all duration-300"></div>
      
      {/* Mobile Sidebar Overlay - Only for mobile/tablet */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <div className={`hidden xl:block fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/50`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-lg">
              <img 
                src="/icon.PNG" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">የሚድያ ሽፋን</h1>
              <p className="text-xs text-gray-500">ጥየቃ ሲስተም</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary to-primary-glow text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary'}`} />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {profile?.office_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.office_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? 'Administrator' : 'User'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out xl:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-lg">
              <img 
                src="/icon.PNG" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">የሚድያ ሽፋን</h1>
              <p className="text-xs text-gray-500">ጥየቃ ሲስተም</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary to-primary-glow text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary'}`} />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile User Profile Section */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {profile?.office_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.office_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? 'Administrator' : 'User'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="xl:pl-80 pb-20 xl:pb-0" style={{ marginTop: 'var(--banner-height, 0px)' }}>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky z-30 transition-all duration-300" style={{ top: 'var(--banner-height, 0px)' }}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="xl:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Page Title */}
              <div className="flex-1 lg:flex-none">
                <h2 className="text-xl font-semibold text-gray-900">
                  {navigationItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
                </h2>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative text-gray-600 hover:text-primary"
                    onClick={() => navigate('/admin/requests')}
                  >
                    <Bell className="h-5 w-5" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </span>
                    )}
                  </Button>
                )}
                
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <span>Welcome,</span>
                  <span className="font-medium">{profile?.office_name}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile and Tablet Only */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/50">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-500 hover:text-primary hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 truncate max-w-full ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs mt-1 truncate max-w-full">
              ውጣ
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Image,
  FolderTree,
  Package,
  Home,
  ShoppingCart,
  Users,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Bannere Hero', url: '/bannere', icon: Image },
  { title: 'Categorii', url: '/categorii', icon: FolderTree },
  { title: 'Produse', url: '/produse', icon: Package },
  { title: 'Configurare Homepage', url: '/homepage', icon: Home },
  { title: 'Comenzi', url: '/comenzi', icon: ShoppingCart },
  { title: 'Utilizatori', url: '/utilizatori', icon: Users },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  hideSidebar?: boolean;
}

export function AdminLayout({ children, title, hideSidebar = false }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  if (hideSidebar) {
    return (
      <div className="min-h-screen bg-background">
        <header className="h-14 border-b border-border flex items-center px-6 bg-card">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </header>
        <main className="p-6 flex items-center justify-center">
          <div className="w-full max-w-2xl">{children}</div>
        </main>
      </div>
    );
  }

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarContent>
            <div className="p-4 border-b border-border">
              <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">E-Commerce</p>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4 py-2">
                Meniu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'text-foreground hover:bg-muted'
                            }`}
                            activeClassName=""
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto p-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors rounded-md font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Ieșire</span>
              </button>
            </div>
          </SidebarContent>
        </Sidebar>

          
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

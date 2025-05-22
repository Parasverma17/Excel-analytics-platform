import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart2, 
  Upload, 
  Home, 
  History, 
  Settings, 
  Users, 
  Menu, 
  X,
  BarChart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/upload', label: 'Upload Data', icon: <Upload size={20} /> },
    { path: '/visualizations', label: 'Visualizations', icon: <BarChart2 size={20} /> },
    { path: '/history', label: 'History', icon: <History size={20} /> },
  ];

  // Admin only routes
  const adminRoutes = [
    { path: '/users', label: 'Manage Users', icon: <Users size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
    expanded ? 'md:w-64' : 'md:w-20'
  } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`;

  return (
    <>
      {/* Mobile toggle button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobile}
          className="p-2 rounded-md text-gray-500 bg-white shadow-lg focus:outline-none"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-4 border-b border-gray-800">
            <div className="flex items-center justify-between w-full">
              {expanded && (
                <div className="flex items-center space-x-2">
                  <BarChart className="h-8 w-8 text-blue-400" />
                  <span className="text-xl font-bold">DataViz</span>
                </div>
              )}
              {!expanded && (
                <div className="mx-auto">
                  <BarChart className="h-8 w-8 text-blue-400" />
                </div>
              )}
              <button 
                onClick={toggleSidebar} 
                className="hidden md:block p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                {expanded ? 
                  <X size={20} className="text-gray-400" /> : 
                  <Menu size={20} className="text-gray-400" />
                }
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center py-2 px-4 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`
                    }
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {(expanded || mobileOpen) && (
                      <span className="ml-3 transition-opacity">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              ))}
              
              {user?.role === 'admin' && (
                <>
                  <li className="pt-5 pb-2">
                    {(expanded || mobileOpen) && (
                      <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Admin
                      </p>
                    )}
                  </li>
                  {adminRoutes.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => 
                          `flex items-center py-2 px-4 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-300 hover:bg-gray-800'
                          }`
                        }
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {(expanded || mobileOpen) && (
                          <span className="ml-3 transition-opacity">{item.label}</span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          <div className="p-4 border-t border-gray-800">
            {(expanded || mobileOpen) ? (
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {user?.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.role}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {user?.name.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
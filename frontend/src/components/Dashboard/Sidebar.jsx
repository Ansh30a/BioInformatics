import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Database, 
  BarChart3, 
  User,
  FileSpreadsheet,
  TrendingUp,
  X
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', exact: true },
    { path: '/datasets', icon: Database, label: 'Datasets' },
    { path: '/analysis', icon: BarChart3, label: 'Analysis' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-64 glass-card !rounded-[24px] m-4 lg:m-6
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shrink-0
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={onClose} // Close mobile menu on navigation
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Quick Stats - Hidden on small screens */}
          <div className="mt-8 pt-4 border-t border-gray-200 hidden sm:block">
            <div className="px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                  <span className="truncate">Active Datasets</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                  <span className="truncate">Recent Analysis</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar

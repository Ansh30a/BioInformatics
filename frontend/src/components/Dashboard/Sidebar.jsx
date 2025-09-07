import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Database, 
  BarChart3, 
  User,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react'

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', exact: true },
    { path: '/datasets', icon: Database, label: 'Datasets' },
    { path: '/analysis', icon: BarChart3, label: 'Analysis' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-primary-500" />
                <span>Active Datasets</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                <span>Recent Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
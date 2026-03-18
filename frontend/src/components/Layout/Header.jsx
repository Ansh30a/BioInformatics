import React, { useState } from 'react'
import { User, LogOut, Settings, Menu, X, ChevronDown } from 'lucide-react'

const Header = ({ user, onLogout, onMenuToggle, isMobileMenuOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false)

  // Use pathname to determine title accurately
  const path = window.location.pathname
  let title = "Dashboard"
  if (path.includes('datasets')) title = "Datasets"
  if (path.includes('analysis')) title = "Analysis"
  if (path.includes('profile')) title = "Profile Settings"

  return (
    <header className="bg-transparent px-2 sm:px-6 pt-6 pb-2 sm:pt-10 sm:pb-4 z-40 w-full">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors shadow-sm bg-white/50"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-slate-800 tracking-tight ml-2">
            {title}
          </h1>
        </div>
        
        {/* User Menu - matches image exactly */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 px-2 py-1.5 sm:pl-2 sm:pr-4 sm:py-2 rounded-full bg-white hover:bg-slate-50 transition-colors shadow-sm border border-slate-100"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold overflow-hidden">
              {/* Replace with an actual avatar image ideally, using initial for now */}
              <img src={`https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=FFEDD5&color=C2410C&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-[15px] font-semibold text-slate-800">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-3 w-56 glass-card py-2 z-20 shadow-[0_10px_40px_rgba(0,0,0,0.08)] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                </div>
                
                <div className="hidden sm:block px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                </div>
                
                <div className="py-1">
                  <a
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 transition-colors mx-1 rounded-lg"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </a>
                  
                  <a
                    href="/settings"
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 transition-colors mx-1 rounded-lg"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </a>
                </div>
                
                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onLogout()
                    }}
                    className="flex items-center space-x-3 w-[calc(100%-8px)] mx-1 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

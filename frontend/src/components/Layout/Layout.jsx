import React, { useState } from 'react'
import Header from './Header'
import Sidebar from '../Dashboard/Sidebar'

const Layout = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-0 lg:p-6 overflow-hidden">
      {/* Main Glass App Container - Float effect for large screens */}
      <div className="w-full lg:max-w-[1500px] h-screen lg:h-[94vh] lg:rounded-[36px] glass-app-container flex flex-col md:flex-row overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={isMobileMenuOpen}
          onClose={handleMenuClose}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">
          <Header 
            user={user} 
            onLogout={onLogout}
            onMenuToggle={handleMenuToggle}
            isMobileMenuOpen={isMobileMenuOpen}
          />
          <main className="flex-1 p-5 lg:p-10 overflow-y-auto overflow-x-hidden relative">
            <div className="w-full max-w-[1200px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout

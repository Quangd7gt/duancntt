import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * MainLayout Component
 * Main layout wrapper for authenticated pages
 */
const MainLayout = ({ title }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main content */}
                <div className="flex-1 lg:ml-0">
                    {/* Navbar */}
                    <Navbar
                        onMenuClick={() => setSidebarOpen(true)}
                        title={title}
                    />

                    {/* Page content */}
                    <main className="p-4 lg:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;

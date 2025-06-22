import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCV } from '../contexts/CVContext';
import { useLocation } from 'react-router-dom';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { cvData, isLoading, loadUserCV } = useCV();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalCVs: 0,
    jobApplications: 0,
    lastUpdate: null
  });  useEffect(() => {
    if (user) {
      loadUserCV();
    }
  }, [user, loadUserCV]);
  // Force refresh when coming from certain pages
  useEffect(() => {
    // If coming from CV builder or if location state indicates refresh needed
    if (location.state?.refreshCV) {
      console.log('🔄 Dashboard: Forced refresh requested');
      if (user) {
        loadUserCV();
      }
      // Clear the state to prevent unnecessary re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user, loadUserCV]);

  // Refresh CV data when page becomes visible/focused
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        loadUserCV();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, loadUserCV]);
  useEffect(() => {
    // Update stats when cvData changes
    setStats({
      totalCVs: cvData ? 1 : 0,
      jobApplications: 0,
      lastUpdate: cvData?.updatedAt || null
    });
  }, [cvData]);

  // Add refresh function
  const refreshCV = async () => {
    if (user) {
      await loadUserCV();
    }
  };

  const quickActions = [
    {
      title: 'Create/Edit CV',
      description: 'Build or update your professional CV',
      icon: '📝',
      link: '/cv-builder',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Job Application',
      description: 'Tailor CV for specific job opportunities',
      icon: '🎯',
      link: '/job-application',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Profile',
      description: 'Manage your account settings',
      icon: '👤',
      link: '/profile',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const recentActivity = [
    {
      action: 'CV Updated',
      date: new Date().toLocaleDateString(),
      description: 'Last modified your professional CV'
    },
    {
      action: 'Account Created',
      date: new Date(user?.createdAt || Date.now()).toLocaleDateString(),
      description: 'Welcome to CV Maker!'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to build your perfect CV? Let's get started!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total CVs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCVs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Job Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.jobApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Update</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <Link to={action.link} className="block">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{action.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{action.description}</p>
                    <Button
                      variant="primary"
                      size="sm"
                      className={`w-full ${action.color}`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>          </motion.div>

          {/* CV Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your CV Status</h2>
              <Button
                onClick={refreshCV}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : '🔄 Refresh'}
              </Button>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              {cvData ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">CV Ready</h3>
                      <p className="text-sm text-gray-600">Your CV is complete and ready to use</p>
                    </div>
                  </div>
                  
                  {cvData.personalInfo && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">CV Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {cvData.personalInfo.email}
                        </div>
                        <div>
                          <span className="font-medium">Experience:</span> {cvData.experience?.length || 0} positions
                        </div>
                        <div>
                          <span className="font-medium">Skills:</span> {cvData.skills?.length || 0} skills
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex space-x-3">
                      <Link to="/cv-builder">
                        <Button variant="outline" size="sm">
                          📝 Edit CV
                        </Button>
                      </Link>
                      <Link to="/job-application">
                        <Button variant="primary" size="sm">
                          🎯 Apply for Jobs
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-3 rounded-full bg-gray-100 text-gray-400 mx-auto mb-4 w-12 h-12 flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No CV Found</h3>
                  <p className="text-gray-600 mb-4">Create your first CV to get started</p>
                  <Link to="/cv-builder">
                    <Button variant="primary">
                      📝 Create CV
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.action}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CV Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your CV Status</h2>
            {cvData ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-medium">✅ CV Ready</p>
                  <p className="text-sm text-gray-600">
                    Your professional CV is complete and ready to use
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link to="/cv-builder">
                    <Button variant="outline" size="sm">
                      Edit CV
                    </Button>
                  </Link>
                  <Link to="/job-application">
                    <Button variant="primary" size="sm">
                      Apply for Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 font-medium">⏳ CV Incomplete</p>
                  <p className="text-sm text-gray-600">
                    Create your professional CV to get started
                  </p>
                </div>
                <Link to="/cv-builder">
                  <Button variant="primary" size="sm">
                    Create CV
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;

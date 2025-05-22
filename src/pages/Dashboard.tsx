import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, FileSpreadsheet, Users, Clock, ChevronRight, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { datasets } = useData();

  const stats = [
    { name: 'Total Datasets', value: datasets.length, icon: <FileSpreadsheet className="h-6 w-6 text-blue-500" /> },
    { name: 'Visualizations', value: datasets.length * 2, icon: <BarChart2 className="h-6 w-6 text-green-500" /> },
    { name: 'Team Members', value: 5, icon: <Users className="h-6 w-6 text-purple-500" /> },
    { name: 'Last Upload', value: datasets.length ? '5 minutes ago' : 'N/A', icon: <Clock className="h-6 w-6 text-orange-500" /> },
  ];

  // Get recent datasets (up to 5)
  const recentDatasets = [...datasets]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your data today.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link 
            to="/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload New Data
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {recentDatasets.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentDatasets.map((dataset) => (
                    <li key={dataset.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {dataset.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {dataset.columns.length} columns • {dataset.data.length} rows
                          </p>
                        </div>
                        <div>
                          <Link
                            to="/visualizations"
                            className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-10">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No datasets</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading your first dataset.
                </p>
                <div className="mt-6">
                  <Link
                    to="/upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Upload className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Upload a file
                  </Link>
                </div>
              </div>
            )}
          </div>
          {recentDatasets.length > 0 && (
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
              <div className="text-sm">
                <Link
                  to="/history"
                  className="font-medium text-blue-600 hover:text-blue-500 flex items-center"
                >
                  View all activity
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-blue-50 overflow-hidden rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                <Link to="/upload" className="block p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-blue-900">Upload Data</h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Import new Excel data for analysis
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="bg-green-50 overflow-hidden rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
                <Link to="/visualizations" className="block p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <BarChart2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-green-900">Visualize</h4>
                      <p className="mt-1 text-sm text-green-700">
                        Create charts from your data
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="bg-purple-50 overflow-hidden rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
                <Link to="/history" className="block p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-purple-900">History</h4>
                      <p className="mt-1 text-sm text-purple-700">
                        View your data history
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="bg-orange-50 overflow-hidden rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors">
                <a href="#tutorial" className="block p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-orange-900">Tutorial</h4>
                      <p className="mt-1 text-sm text-orange-700">
                        Learn how to use DataViz
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
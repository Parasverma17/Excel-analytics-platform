import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, PieChart, LineChart, AreaChart, BarChart, Download, ArrowLeft, ChevronDown, Settings, Upload } from 'lucide-react';
import { useData, DataSet } from '../context/DataContext';
import Chart from 'chart.js/auto';

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'area';

const Visualizations: React.FC = () => {
  const { datasets, currentDataset, setCurrentDataset } = useData();
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [showDatasetDropdown, setShowDatasetDropdown] = useState(false);
  const [showChartDropdown, setShowChartDropdown] = useState(false);
  const [chartTitle, setChartTitle] = useState('Data Visualization');
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // If no current dataset but we have datasets, set the first one
  useEffect(() => {
    if (!currentDataset && datasets.length > 0) {
      setCurrentDataset(datasets[0]);
    }
  }, [datasets, currentDataset, setCurrentDataset]);

  // Set default axes when dataset changes
  useEffect(() => {
    if (currentDataset && currentDataset.columns.length >= 2) {
      // Default to first column for X-axis and second for Y-axis
      setXAxis(currentDataset.columns[0]);
      setYAxis(currentDataset.columns[1]);
    }
  }, [currentDataset]);

  // Create or update chart when necessary
  useEffect(() => {
    if (chartRef.current && currentDataset && xAxis && yAxis) {
      renderChart();
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [currentDataset, chartType, xAxis, yAxis, chartTitle]);

  const renderChart = () => {
    if (!chartRef.current || !currentDataset) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Prepare data
    const labels = currentDataset.data.map(item => String(item[xAxis]));
    const dataPoints = currentDataset.data.map(item => Number(item[yAxis]) || 0);
    
    // Create dataset config based on chart type
    let datasets = [];
    const colorPalette = [
      'rgba(59, 130, 246, 0.7)', // Blue
      'rgba(16, 185, 129, 0.7)', // Green
      'rgba(245, 158, 11, 0.7)', // Amber
      'rgba(239, 68, 68, 0.7)',  // Red
      'rgba(139, 92, 246, 0.7)', // Purple
    ];
    
    const borderColor = colorPalette[0].replace('0.7', '1');
    const backgroundColor = colorPalette[0];
    
    if (chartType === 'pie' || chartType === 'doughnut') {
      datasets = [{
        label: yAxis,
        data: dataPoints,
        backgroundColor: labels.map((_, i) => colorPalette[i % colorPalette.length]),
        borderColor: labels.map((_, i) => colorPalette[i % colorPalette.length].replace('0.7', '1')),
        borderWidth: 1
      }];
    } else if (chartType === 'scatter') {
      // For scatter, we need x,y point pairs
      const points = currentDataset.data.map(item => ({
        x: Number(item[xAxis]) || 0,
        y: Number(item[yAxis]) || 0
      }));
      
      datasets = [{
        label: `${xAxis} vs ${yAxis}`,
        data: points,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1
      }];
    } else {
      // For bar, line, area
      datasets = [{
        label: yAxis,
        data: dataPoints,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
        fill: chartType === 'area'
      }];
    }
    
    // Determine actual chart type for Chart.js (area is actually line with fill)
    const chartJsType = chartType === 'area' ? 'line' : chartType;
    
    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: chartJsType,
      data: {
        labels: chartType === 'scatter' ? undefined : labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chartTitle,
            font: {
              size: 18
            }
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: chartType === 'pie' || chartType === 'doughnut' ? undefined : {
          x: {
            title: {
              display: true,
              text: xAxis
            }
          },
          y: {
            title: {
              display: true,
              text: yAxis
            },
            beginAtZero: true
          }
        }
      }
    });
  };

  // Helper to check if a column contains numeric data
  const isNumericColumn = (column: string): boolean => {
    if (!currentDataset) return false;
    
    // Check a few rows to determine if this is likely a numeric column
    const sampleSize = Math.min(5, currentDataset.data.length);
    let numericCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      const value = currentDataset.data[i][column];
      if (typeof value === 'number' || !isNaN(Number(value))) {
        numericCount++;
      }
    }
    
    // If most samples are numeric, consider it a numeric column
    return numericCount / sampleSize > 0.5;
  };

  // Get numeric columns for Y-axis
  const getNumericColumns = (): string[] => {
    if (!currentDataset) return [];
    return currentDataset.columns.filter(isNumericColumn);
  };

  const downloadChart = () => {
    if (!chartRef.current) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = `${chartTitle.replace(/\s+/g, '_')}.png`;
    link.href = chartRef.current.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ChartTypeIcon = ({ type }: { type: ChartType }) => {
    switch (type) {
      case 'bar': return <BarChart size={20} />;
      case 'line': return <LineChart size={20} />;
      case 'pie': return <PieChart size={20} />;
      case 'area': return <AreaChart size={20} />;
      case 'scatter': return <BarChart2 size={20} />;
      default: return <BarChart size={20} />;
    }
  };

  if (!currentDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="text-center">
          <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No datasets available</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to upload a dataset before you can create visualizations.
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
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Data Visualizations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create, customize, and export visualizations from your data.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-6">
        {/* Sidebar with controls */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6 space-y-6">
              {/* Dataset Selection */}
              <div>
                <label htmlFor="dataset" className="block text-sm font-medium text-gray-700">
                  Dataset
                </label>
                <div className="mt-1 relative">
                  <button
                    type="button"
                    className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    onClick={() => setShowDatasetDropdown(!showDatasetDropdown)}
                    aria-haspopup="listbox"
                    aria-expanded={showDatasetDropdown}
                  >
                    <span className="block truncate">{currentDataset.name}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </button>

                  {showDatasetDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {datasets.map((dataset) => (
                        <div
                          key={dataset.id}
                          className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                            currentDataset.id === dataset.id ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`}
                          onClick={() => {
                            setCurrentDataset(dataset);
                            setShowDatasetDropdown(false);
                          }}
                        >
                          <span className="block truncate">{dataset.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Title */}
              <div>
                <label htmlFor="chart-title" className="block text-sm font-medium text-gray-700">
                  Chart Title
                </label>
                <input
                  type="text"
                  id="chart-title"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              {/* Chart Type */}
              <div>
                <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700">
                  Chart Type
                </label>
                <div className="mt-1 relative">
                  <button
                    type="button"
                    className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    onClick={() => setShowChartDropdown(!showChartDropdown)}
                    aria-haspopup="listbox"
                    aria-expanded={showChartDropdown}
                  >
                    <span className="flex items-center">
                      <ChartTypeIcon type={chartType} />
                      <span className="ml-2 block truncate capitalize">{chartType} Chart</span>
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </button>

                  {showChartDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {(['bar', 'line', 'pie', 'doughnut', 'scatter', 'area'] as ChartType[]).map((type) => (
                        <div
                          key={type}
                          className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                            chartType === type ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`}
                          onClick={() => {
                            setChartType(type);
                            setShowChartDropdown(false);
                          }}
                        >
                          <span className="flex items-center">
                            <ChartTypeIcon type={type} />
                            <span className="ml-2 block truncate capitalize">{type} Chart</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* X Axis Selection */}
              <div>
                <label htmlFor="x-axis" className="block text-sm font-medium text-gray-700">
                  X-Axis
                </label>
                <select
                  id="x-axis"
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select X-Axis</option>
                  {currentDataset.columns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>

              {/* Y Axis Selection */}
              <div>
                <label htmlFor="y-axis" className="block text-sm font-medium text-gray-700">
                  Y-Axis
                </label>
                <select
                  id="y-axis"
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Y-Axis</option>
                  {getNumericColumns().map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={downloadChart}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Chart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-4">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="chart-container h-96">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Data Preview */}
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Data Preview
              </h3>
              <button
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Settings className="mr-1 h-4 w-4" />
                Customize
              </button>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {currentDataset.columns.map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDataset.data.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {currentDataset.columns.map((column) => (
                          <td
                            key={`${rowIndex}-${column}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {String(row[column] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {currentDataset.data.length > 5 && (
                <div className="py-2 text-center text-sm text-gray-500">
                  Showing 5 of {currentDataset.data.length} rows
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
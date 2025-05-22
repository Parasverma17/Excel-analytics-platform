import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, File, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData, DataPoint } from '../context/DataContext';
import { read, utils } from 'xlsx';

const UploadFile: React.FC = () => {
  const { user } = useAuth();
  const { addDataset } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<DataPoint[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [datasetName, setDatasetName] = useState('');

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Only Excel and CSV files are supported.');
      return;
    }
    
    setFile(file);
    setError(null);
    setLoading(true);
    
    try {
      // Set default dataset name
      setDatasetName(file.name.replace(/\.[^/.]+$/, ""));
      
      // Read the file
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json<DataPoint>(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error('No data found in the file.');
      }
      
      // Get columns
      const columns = Object.keys(jsonData[0]);
      setColumns(columns);
      
      // Set preview data (first 5 rows)
      setPreviewData(jsonData.slice(0, 5));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file.');
      setFile(null);
      setPreviewData(null);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !previewData || columns.length === 0) {
      setError('No valid data to upload.');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, this would be where we'd upload to a server
      // Here we'll just read the file and process it
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json<DataPoint>(worksheet);
      
      // Create a new dataset
      const newDataset = {
        id: Date.now().toString(),
        name: datasetName || file.name.replace(/\.[^/.]+$/, ""),
        data: jsonData,
        columns,
        createdAt: new Date(),
        createdBy: user?.id || 'unknown'
      };
      
      // Add to context
      addDataset(newDataset);
      
      // Navigate to visualizations
      navigate('/visualizations');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file.');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewData(null);
    setColumns([]);
    setError(null);
    setDatasetName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Upload Data
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload Excel or CSV files to visualize your data.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {!file ? (
            <div
              className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".xlsx,.xls,.csv"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">Excel or CSV files up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileSpreadsheet className="h-10 w-10 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {columns.length} columns • {previewData ? previewData.length : 0} rows
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div>
                <label htmlFor="dataset-name" className="block text-sm font-medium text-gray-700">
                  Dataset Name
                </label>
                <input
                  type="text"
                  name="dataset-name"
                  id="dataset-name"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter a name for this dataset"
                />
              </div>

              {previewData && previewData.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900">Data Preview</h4>
                  <div className="mt-2 flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {columns.map((column) => (
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
                              {previewData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {columns.map((column) => (
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
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-md bg-red-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          {file && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Processing...' : 'Continue to Visualization'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Supported file formats
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden border rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                    <File className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Excel (.xlsx)</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Modern Excel format
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden border rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                    <File className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Excel (.xls)</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Legacy Excel format
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden border rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-50 rounded-md p-3">
                    <File className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">CSV (.csv)</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Comma-separated values
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Database, AlertCircle, CheckCircle, X, Eye, Package, Tags } from 'lucide-react';
import { supabase } from '@/lib/supabase';


const DualExcelUploader = () => {
  // Состояние для продуктов
  const [productsFile, setProductsFile] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [productsHeaders, setProductsHeaders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsUploading, setProductsUploading] = useState(false);
  const [productsMessage, setProductsMessage] = useState('');
  const [productsMessageType, setProductsMessageType] = useState('');
  const [productsShowPreview, setProductsShowPreview] = useState(false);

  // Состояние для категорий
  const [categoriesFile, setCategoriesFile] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoriesHeaders, setCategoriesHeaders] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesUploading, setCategoriesUploading] = useState(false);
  const [categoriesMessage, setCategoriesMessage] = useState('');
  const [categoriesMessageType, setCategoriesMessageType] = useState('');
  const [categoriesShowPreview, setCategoriesShowPreview] = useState(false);

  // Очистка состояния продуктов
  const clearProductsState = () => {
    setProductsFile(null);
    setProductsData([]);
    setProductsHeaders([]);
    setProductsMessage('');
    setProductsMessageType('');
    setProductsShowPreview(false);
  };

  // Очистка состояния категорий
  const clearCategoriesState = () => {
    setCategoriesFile(null);
    setCategoriesData([]);
    setCategoriesHeaders([]);
    setCategoriesMessage('');
    setCategoriesMessageType('');
    setCategoriesShowPreview(false);
  };

  // Валидация файла
  const validateFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      return 'Пожалуйста, выберите файл Excel (.xlsx или .xls)';
    }
    
    if (file.size > maxSize) {
      return 'Размер файла не должен превышать 10MB';
    }
    
    return null;
  };

  // Обработка выбора файла продуктов
  const handleProductsFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return;
    
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setProductsMessage(validationError);
      setProductsMessageType('error');
      return;
    }
    
    setProductsFile(selectedFile);
    processProductsFile(selectedFile);
  };

  // Обработка выбора файла категорий
  const handleCategoriesFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return;
    
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setCategoriesMessage(validationError);
      setCategoriesMessageType('error');
      return;
    }
    
    setCategoriesFile(selectedFile);
    processCategoriesFile(selectedFile);
  };

  // Обработка файла продуктов
  const processProductsFile = async (file) => {
    setProductsLoading(true);
    setProductsMessage('');
    setProductsData([]);
    setProductsHeaders([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('Файл пустой или не содержит данных');
      }
      
      if (jsonData.length === 1) {
        throw new Error('Файл содержит только заголовки, нет данных для обработки');
      }
      
      const fileHeaders = jsonData[0].filter(header => header && header.toString().trim());
      
      if (fileHeaders.length === 0) {
        throw new Error('Не найдены заголовки в файле');
      }
      
      const processedRows = jsonData.slice(1)
        .map((row, index) => {
          const rowObject = {};
          
          fileHeaders.forEach((header, headerIndex) => {
            const cellValue = row[headerIndex];
            rowObject[header.toString().trim()] = cellValue ? cellValue.toString().trim() : '';
          });

          // Специальная обработка для колонки с категориями
          const possibleCategoryColumns = [
            'products', 'Категория', 'CATEGORY', 'Category', 'category',
            'Продукты', 'PRODUCTS', 'Products', 'mini_category'
          ];
          
          let rawCategory = '';
          for (const colName of possibleCategoryColumns) {
            if (rowObject[colName]) {
              rawCategory = rowObject[colName];
              break;
            }
          }
          if (rawCategory) {
            const categoryParts = rawCategory.split('/').map(s => s.trim());
            rowObject['category'] = categoryParts[0] || '';
            rowObject['mini_category'] = categoryParts[1] || '';
          } else {
            rowObject['category'] = '';
            rowObject['mini_category'] = '';
          }

          return { id: index + 1, ...rowObject };
        })
        .filter(row => {
          const values = Object.values(row).filter(val => val !== 'id');
          return values.some(value => value && value.toString().trim() !== '');
        });
        
      if (processedRows.length === 0) {
        throw new Error('После обработки не осталось валидных строк данных');
      }
      
      setProductsHeaders(fileHeaders);
      setProductsData(processedRows);
      setProductsShowPreview(true);
      setProductsMessage(`Успешно обработано ${processedRows.length} строк из файла "${file.name}"`);
      setProductsMessageType('success');
      
    } catch (error) {
      console.error('Ошибка при обработке файла продуктов:', error);
      setProductsMessage(error.message || 'Ошибка при чтении файла Excel');
      setProductsMessageType('error');
      setProductsData([]);
      setProductsHeaders([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Обработка файла категорий
  const processCategoriesFile = async (file) => {
    setCategoriesLoading(true);
    setCategoriesMessage('');
    setCategoriesData([]);
    setCategoriesHeaders([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('Файл пустой или не содержит данных');
      }
      
      if (jsonData.length === 1) {
        throw new Error('Файл содержит только заголовки, нет данных для обработки');
      }
      
      const fileHeaders = jsonData[0].filter(header => header && header.toString().trim());
      
      if (fileHeaders.length === 0) {
        throw new Error('Не найдены заголовки в файле');
      }
      
      const processedRows = jsonData.slice(1)
        .map((row, index) => {
          const rowObject = {};
          
          fileHeaders.forEach((header, headerIndex) => {
            const cellValue = row[headerIndex];
            rowObject[header.toString().trim()] = cellValue ? cellValue.toString().trim() : '';
          });

          return { id: index + 1, ...rowObject };
        })
        .filter(row => {
          const values = Object.values(row).filter(val => val !== 'id');
          return values.some(value => value && value.toString().trim() !== '');
        });
        
      if (processedRows.length === 0) {
        throw new Error('После обработки не осталось валидных строк данных');
      }
      
      setCategoriesHeaders(fileHeaders);
      setCategoriesData(processedRows);
      setCategoriesShowPreview(true);
      setCategoriesMessage(`Успешно обработано ${processedRows.length} строк из файла "${file.name}"`);
      setCategoriesMessageType('success');
      
    } catch (error) {
      console.error('Ошибка при обработке файла категорий:', error);
      setCategoriesMessage(error.message || 'Ошибка при чтении файла Excel');
      setCategoriesMessageType('error');
      setCategoriesData([]);
      setCategoriesHeaders([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Загрузка продуктов в Supabase
  const uploadProductsToSupabase = async () => {
    if (productsData.length === 0) {
      setProductsMessage('Нет данных для загрузки');
      setProductsMessageType('error');
      return;
    }

    setProductsUploading(true);
    setProductsMessage('Загрузка данных в базу данных...');
    setProductsMessageType('');

    try {
      const dataToUpload = productsData.map(row => {
        const { id, ...rowData } = row;
        return rowData;
      });

      const { data: result, error } = await supabase
        .from('products')
        .insert(dataToUpload);

      if (error) throw error;
      
      setProductsMessage(`Успешно загружено ${productsData.length} записей в таблицу products`);
      setProductsMessageType('success');
      
      setTimeout(() => {
        clearProductsState();
        const fileInput = document.querySelector('#products-file-input');
        if (fileInput) fileInput.value = '';
      }, 3000);
      
    } catch (error) {
      console.error('Ошибка при загрузке продуктов в Supabase:', error);
      setProductsMessage(`Ошибка при загрузке данных: ${error.message}`);
      setProductsMessageType('error');
    } finally {
      setProductsUploading(false);
    }
  };

  // Загрузка категорий в Supabase
  const uploadCategoriesToSupabase = async () => {
    if (categoriesData.length === 0) {
      setCategoriesMessage('Нет данных для загрузки');
      setCategoriesMessageType('error');
      return;
    }

    setCategoriesUploading(true);
    setCategoriesMessage('Загрузка данных в базу данных...');
    setCategoriesMessageType('');

    try {
      const dataToUpload = categoriesData.map(row => {
        const { id, ...rowData } = row;
        return rowData;
      });

      const { data: result, error } = await supabase
        .from('categories')
        .insert(dataToUpload);

      if (error) throw error;
      
      setCategoriesMessage(`Успешно загружено ${categoriesData.length} записей в таблицу categories`);
      setCategoriesMessageType('success');
      
      setTimeout(() => {
        clearCategoriesState();
        const fileInput = document.querySelector('#categories-file-input');
        if (fileInput) fileInput.value = '';
      }, 3000);
      
    } catch (error) {
      console.error('Ошибка при загрузке категорий в Supabase:', error);
      setCategoriesMessage(`Ошибка при загрузке данных: ${error.message}`);
      setCategoriesMessageType('error');
    } finally {
      setCategoriesUploading(false);
    }
  };

  const FileUploadBlock = ({ 
    title, 
    icon: Icon, 
    file, 
    loading, 
    uploading, 
    message, 
    messageType, 
    data, 
    headers, 
    showPreview, 
    onFileSelect, 
    onClearState, 
    onUpload, 
    fileInputId,
    bgColor = "bg-blue-50",
    borderColor = "border-blue-200",
    iconColor = "text-blue-600"
  }) => (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Icon className={`h-5 w-5 mr-2 ${iconColor}`} />
              {title}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Выберите файл Excel (.xlsx/.xls) для загрузки данных
            </p>
          </div>
          {file && (
            <button
              onClick={onClearState}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Очистить"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выберите Excel файл
          </label>
          <div className="flex items-center justify-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              file 
                ? `border-green-300 bg-green-50 hover:bg-green-100` 
                : `border-gray-300 bg-gray-50 hover:bg-gray-100`
            }`}>
              <div className="flex flex-col items-center justify-center pt-4 pb-5">
                <Upload className={`w-6 h-6 mb-2 ${file ? 'text-green-500' : 'text-gray-400'}`} />
                <p className="mb-1 text-sm text-gray-500">
                  <span className="font-semibold">
                    {file ? 'Нажмите для выбора другого файла' : 'Нажмите для выбора файла'}
                  </span>
                </p>
                <p className="text-xs text-gray-500">Поддерживаются .xlsx и .xls файлы (до 10MB)</p>
              </div>
              <input
                id={fileInputId}
                type="file"
                accept=".xlsx,.xls"
                onChange={onFileSelect}
                className="hidden"
                disabled={loading || uploading}
              />
            </label>
          </div>
          
          {file && (
            <div className={`mt-3 p-3 ${bgColor} ${borderColor} border rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Файл:</span> {file.name}
                </div>
                <div className="text-xs text-blue-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className={`flex items-center justify-center py-6 ${bgColor} rounded-lg ${borderColor} border`}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-700 font-medium">Обработка файла...</span>
          </div>
        )}

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-start text-sm ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : messageType === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : `${bgColor} text-blue-800 ${borderColor} border`
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            ) : messageType === 'error' ? (
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <Database className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        {data.length > 0 && !loading && showPreview && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-800 flex items-center">
                <Eye className={`h-4 w-4 mr-2 ${iconColor}`} />
                Превью данных ({data.length} строк)
              </h3>
              <button
                onClick={onUpload}
                disabled={uploading}
                className={`inline-flex items-center px-4 py-2 ${iconColor.replace('text-', 'bg-').replace('-600', '-600')} text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 text-sm`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Загружается...
                  </>
                ) : (
                  <>
                    <Database className="h-3 w-3 mr-2" />
                    Загрузить в Supabase
                  </>
                )}
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-80">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50">
                        #
                      </th>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 bg-gray-50"
                          title={header}
                        >
                          <div className="truncate max-w-24">
                            {header}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-sm text-gray-500 border-r border-gray-200 font-medium">
                          {rowIndex + 1}
                        </td>
                        {headers.map((header, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 last:border-r-0"
                            title={row[header]}
                          >
                            <div className="truncate max-w-24">
                              {row[header] || '-'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {data.length > 5 && (
                <div className="bg-gray-50 px-3 py-2 text-center text-xs text-gray-500 border-t border-gray-200">
                  Показано первые 5 строк из {data.length}. Все строки будут загружены в базу данных.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Загрузка данных из Excel
        </h1>
        <p className="text-gray-600">
          Выберите тип данных для загрузки в соответствующую таблицу Supabase
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Блок загрузки продуктов */}
        <FileUploadBlock
          title="Загрузка продуктов"
          icon={Package}
          file={productsFile}
          loading={productsLoading}
          uploading={productsUploading}
          message={productsMessage}
          messageType={productsMessageType}
          data={productsData}
          headers={productsHeaders}
          showPreview={productsShowPreview}
          onFileSelect={handleProductsFileSelect}
          onClearState={clearProductsState}
          onUpload={uploadProductsToSupabase}
          fileInputId="products-file-input"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          iconColor="text-blue-600"
        />

        {/* Блок загрузки категорий */}
        <FileUploadBlock
          title="Загрузка категорий"
          icon={Tags}
          file={categoriesFile}
          loading={categoriesLoading}
          uploading={categoriesUploading}
          message={categoriesMessage}
          messageType={categoriesMessageType}
          data={categoriesData}
          headers={categoriesHeaders}
          showPreview={categoriesShowPreview}
          onFileSelect={handleCategoriesFileSelect}
          onClearState={clearCategoriesState}
          onUpload={uploadCategoriesToSupabase}
          fileInputId="categories-file-input"
          bgColor="bg-green-50"
          borderColor="border-green-200"
          iconColor="text-green-600"
        />
      </div>
    </div>
  );
};

export default DualExcelUploader;
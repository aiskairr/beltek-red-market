import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Database, AlertCircle, CheckCircle, X, Eye, Package, Tags } from 'lucide-react';

// Note: Excel upload is disabled with MoySklad integration
// All data management must be done through MoySklad interface

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

  useEffect(() => {
    console.log('Categories - состояние изменилось:');
    console.log('Categories - categoriesData:', categoriesData);
    console.log('Categories - categoriesData.length:', categoriesData.length);
    console.log('Categories - loading:', categoriesLoading);
    console.log('Categories - showPreview:', categoriesShowPreview);
  }, [categoriesData, categoriesLoading, categoriesShowPreview]);

  useEffect(() => {
    if (categoriesData.length > 0 && !categoriesLoading) {
      console.log('Categories - useEffect: Принудительно устанавливаю showPreview в true');
      setCategoriesShowPreview(true);
    }
  }, [categoriesData, categoriesLoading]);

  // Функция очистки и нормализации данных
  const sanitizeValue = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    
    // Преобразуем в строку и очищаем
    let cleanValue = value.toString().trim();
    
    // Удаляем специальные символы, которые могут вызывать проблемы с PostgreSQL
    cleanValue = cleanValue.replace(/[\x00-\x1F\x7F]/g, ''); // Удаляем управляющие символы
    cleanValue = cleanValue.replace(/["\\']/g, ''); // Удаляем кавычки
    
    return cleanValue;
  };

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
            rowObject[sanitizeValue(header)] = sanitizeValue(cellValue);
          });

          // Специальная обработка для колонки с категориями
          const possibleCategoryColumns = [
            'products', 'Категория', 'CATEGORY', 'Category', 'category',
            'Продукты', 'PRODUCTS', 'Products', 'mini_categories'
          ];
          
          let rawCategory = '';
          for (const colName of possibleCategoryColumns) {
            if (rowObject[colName]) {
              rawCategory = rowObject[colName];
              break;
            }
          }
          
          if (rawCategory) {
            const categoryParts = rawCategory.split('/').map(s => sanitizeValue(s));
            rowObject['category'] = categoryParts[0] || '';
            rowObject['mini_categories'] = categoryParts[1] || '';
          } else {
            rowObject['category'] = '';
            rowObject['mini_categories'] = '';
          }

          return { id: index + 1, ...rowObject };
        })
        .filter((row) => {
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

  // Улучшенная обработка файла категорий
  const processCategoriesFile = async (file) => {
    setCategoriesLoading(true);
    setCategoriesMessage('');
    setCategoriesData([]);
    setCategoriesHeaders([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      console.log('Categories - Листы в файле:', workbook.SheetNames);
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log('Categories - Сырые данные из Excel:', jsonData);
      
      if (jsonData.length === 0) {
        throw new Error('Файл пустой или не содержит данных');
      }
      
      if (jsonData.length === 1) {
        throw new Error('Файл содержит только заголовки, нет данных для обработки');
      }
      
      const fileHeaders = jsonData[0].filter(header => header && header.toString().trim());
      console.log('Categories - Заголовки:', fileHeaders);
      
      if (fileHeaders.length === 0) {
        throw new Error('Не найдены заголовки в файле');
      }
      
      // Создаем новые заголовки для отображения
      const displayHeaders = [...fileHeaders, 'category', 'mini_categories'];
      
      const processedRows = jsonData.slice(1)
        .map((row, index) => {
          const rowObject = {};
          
          // Заполняем данные из исходных колонок с очисткой
          fileHeaders.forEach((header, headerIndex) => {
            const cellValue = row[headerIndex];
            rowObject[sanitizeValue(header)] = sanitizeValue(cellValue);
          });

          // Ищем колонку с категориями (возможные названия)
          const possibleCategoryColumns = [
            'category', 'Category', 'CATEGORY', 'Категория', 'категория',
            'categories', 'Categories', 'CATEGORIES', 'Категории', 'категории'
          ];
          
          let categoryValue = '';
          let foundCategoryColumn = '';
          
          // Ищем колонку с категориями
          for (const colName of possibleCategoryColumns) {
            if (rowObject[colName] && rowObject[colName].toString().trim()) {
              categoryValue = sanitizeValue(rowObject[colName]);
              foundCategoryColumn = colName;
              break;
            }
          }
          
          console.log(`Categories - Строка ${index + 1}: найдена категория "${categoryValue}" в колонке "${foundCategoryColumn}"`);
          
          // Разделяем категорию и подкатегорию
          if (categoryValue && categoryValue.includes('/')) {
            const categoryParts = categoryValue.split('/').map(s => sanitizeValue(s)).filter(s => s);
            rowObject['category'] = categoryParts[0] || '';
            rowObject['mini_categories'] = categoryParts.slice(1).join('/') || '';
            
            console.log(`Categories - Разделено: category="${rowObject['category']}", mini_categories="${rowObject['mini_categories']}"`);
          } else if (categoryValue) {
            rowObject['category'] = categoryValue;
            rowObject['mini_categories'] = '';
            
            console.log(`Categories - Без разделения: category="${rowObject['category']}"`);
          } else {
            rowObject['category'] = '';
            rowObject['mini_categories'] = '';
            
            console.log(`Categories - Пустая категория`);
          }

          return { id: index + 1, ...rowObject };
        })
        .filter((row) => {
          const values = Object.values(row).filter(val => val !== 'id');
          const hasData = values.some(value => value && value.toString().trim() !== '');
          
          console.log(`Categories - Строка ${row.id} проходит фильтр:`, hasData);
          return hasData;
        });
        
      console.log('Categories - Обработанные строки:', processedRows);
        
      if (processedRows.length === 0) {
        throw new Error('После обработки не осталось валидных строк данных');
      }
      
      setCategoriesHeaders(displayHeaders);
      setCategoriesData(processedRows);
      setCategoriesShowPreview(true);
      setCategoriesMessage(
        `Успешно обработано ${processedRows.length} строк из файла "${file.name}". ` +
        `Найдено ${processedRows.filter(row => row.category).length} записей с категориями.`
      );
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
      // Подготавливаем данные с дополнительной очисткой
      const dataToUpload = productsData.map(row => {
        const { id, ...rowData } = row;
        
        // Дополнительная очистка всех значений
        const cleanedData = {};
        Object.keys(rowData).forEach(key => {
          const cleanKey = sanitizeValue(key);
          const cleanValue = sanitizeValue(rowData[key]);
          
          // Проверяем, что ключ не пустой
          if (cleanKey) {
            cleanedData[cleanKey] = cleanValue;
          }
        });
        
        return cleanedData;
      });

      console.log('Products - Подготовленные данные для загрузки:', dataToUpload);

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
      // Подготавливаем данные с тщательной очисткой
      const dataToUpload = categoriesData.map(row => {
        const { id, ...rowData } = row;
        
        // Создаем новый объект с очищенными данными
        const cleanedData = {};
        
        Object.keys(rowData).forEach(key => {
          const cleanKey = sanitizeValue(key);
          const cleanValue = sanitizeValue(rowData[key]);
          
          // Проверяем, что ключ не пустой
          if (cleanKey) {
            cleanedData[cleanKey] = cleanValue;
          }
        });
        
        // Убеждаемся, что category и mini_categories присутствуют
        if (!cleanedData.hasOwnProperty('category')) {
          cleanedData.category = '';
        }
        if (!cleanedData.hasOwnProperty('mini_categories')) {
          cleanedData.mini_categories = '';
        }
        
        return cleanedData;
      });

      console.log('Categories - Данные для загрузки в Supabase:', dataToUpload);

      const { data: result, error } = await supabase
        .from('categories')
        .insert(dataToUpload);

      if (error) throw error;
      
      const categoriesCount = dataToUpload.filter(item => item.category).length;
      const miniCategoriesCount = dataToUpload.filter(item => item.mini_categories).length;
      
      setCategoriesMessage(
        `Успешно загружено ${categoriesData.length} записей в таблицу categories. ` +
        `Из них ${categoriesCount} с основными категориями и ${miniCategoriesCount} с подкатегориями.`
      );
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
                className={`inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 text-sm`}
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
                          className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 bg-gray-50 ${
                            header === 'category' || header === 'mini_categories' ? 'bg-yellow-50 text-yellow-800' : ''
                          }`}
                          title={header}
                        >
                          <div className="truncate max-w-24">
                            {header === 'category' ? '🏷️ Категория' : 
                             header === 'mini_categories' ? '🏷️ Подкатегория' : 
                             header}
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
                            className={`px-3 py-2 text-sm text-gray-900 border-r border-gray-200 last:border-r-0 ${
                              header === 'category' || header === 'mini_categories' ? 'bg-yellow-50 font-medium' : ''
                            }`}
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
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Для категорий:</strong> Используйте формат "Категория/Подкатегория" в колонке category. 
            Например: "Тест1/Тест2" будет разделено на category="Тест1" и mini_categories="Тест2"
          </p>
        </div>
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
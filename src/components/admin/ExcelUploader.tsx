import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
const ExcelUploader = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Обработка выбора файла
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(selectedFile);
      processFile(selectedFile);
    } else {
      setMessage('Пожалуйста, выберите файл Excel (.xlsx)');
      setMessageType('error');
    }
  };

  // Обработка файла Excel
  const processFile = async (file) => {
    setLoading(true);
    setMessage('');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Получаем первый лист
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Преобразуем в JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (jsonData.length > 0) {
        // Первая строка как заголовки
        const headers = jsonData[0];
        // Остальные строки как данные
        const rows = jsonData.slice(1).map((row, index) => {
          const rowObject = {};
          headers.forEach((header, headerIndex) => {
            rowObject[header] = row[headerIndex] || '';
          });
          return { id: index + 1, ...rowObject };
        });
        
        setHeaders(headers);
        setData(rows);
        setMessage(`Успешно загружено ${rows.length} строк из файла`);
        setMessageType('success');
      } else {
        setMessage('Файл пустой или не содержит данных');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Ошибка при обработке файла:', error);
      setMessage('Ошибка при чтении файла Excel');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка в Supabase
  const uploadToSupabase = async () => {
    if (data.length === 0) {
      setMessage('Нет данных для загрузки');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
   const { data: result, error } = await supabase
  .from('products') // замените на имя вашей таблицы
  .insert(data.map(row => {
    const { id, ...rowData } = row; // Исключаем временный id
    return rowData;
  }));

if (error) throw error;
      // Симуляция загрузки для демонстрации
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage(`Успешно загружено ${data.length} записей в Supabase`);
      setMessageType('success');
      
      // Очистка после успешной загрузки
      setTimeout(() => {
        setFile(null);
        setData([]);
        setHeaders([]);
        setMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Ошибка при загрузке в Supabase:', error);
      setMessage('Ошибка при загрузке данных в базу данных');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Заголовок */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <FileSpreadsheet className="h-6 w-6 mr-2 text-green-600" />
            Загрузка Excel файла
          </h2>
          <p className="text-gray-600 mt-1">
            Выберите файл Excel (.xlsx) для загрузки данных в базу данных
          </p>
        </div>

        <div className="p-6">
          {/* Блок загрузки файла */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите Excel файл
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Нажмите для выбора файла</span>
                  </p>
                  <p className="text-xs text-gray-500">Только .xlsx файлы</p>
                </div>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            
            {file && (
              <div className="mt-2 text-sm text-gray-600">
                Выбранный файл: <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>

          {/* Сообщения */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-center ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message}
            </div>
          )}

          {/* Индикатор загрузки */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Обработка файла...</span>
            </div>
          )}

          {/* Превью данных */}
          {data.length > 0 && !loading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Превью данных ({data.length} строк)
                </h3>
                <button
                  onClick={uploadToSupabase}
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Загрузить в Supabase
                    </>
                  )}
                </button>
              </div>

              {/* Таблица с данными */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                          #
                        </th>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.slice(0, 10).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500 border-r border-gray-200">
                            {rowIndex + 1}
                          </td>
                          {headers.map((header, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 last:border-r-0"
                            >
                              {row[header] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {data.length > 10 && (
                  <div className="bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
                    Показано первые 10 строк из {data.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;
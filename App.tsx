import React, { useState, useCallback } from 'react';
import Input from './components/Input';
import TextArea from './components/TextArea';
import { CheckCircleIcon, LoadingSpinnerIcon, ShoppingBagIcon, ExclamationTriangleIcon } from './components/Icons';

interface OrderData {
  fullName: string;
  productCode: string;
  phoneNumber: string;
  address: string;
  notes: string;
}

/*
  =============================================================================
  HƯỚNG DẪN TÍCH HỢP GOOGLE SHEETS
  =============================================================================
  1. Tạo một Google Sheet mới để lưu trữ đơn hàng.
  2. Mở trình soạn thảo kịch bản bằng cách vào "Tiện ích mở rộng" > "Apps Script".
  3. Xóa mã mặc định và dán mã Apps Script sau vào:

    function doPost(e) {
      try {
        // Thay "Đơn hàng" bằng tên trang tính của bạn
        var sheetName = "Đơn hàng";
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName); 
        
        if (!sheet) {
          sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
          // Thêm hàng tiêu đề nếu trang tính mới được tạo
          sheet.appendRow(["Thời gian", "Họ và tên", "Mã sản phẩm", "Số điện thoại", "Địa chỉ", "Ghi chú"]);
        }
        
        var data = JSON.parse(e.postData.contents);
        
        sheet.appendRow([
          new Date(),
          data.fullName,
          data.productCode,
          data.phoneNumber,
          data.address,
          data.notes
        ]);
        
        return ContentService
          .createTextOutput(JSON.stringify({ status: "success", message: "Đã thêm đơn hàng." }))
          .setMimeType(ContentService.MimeType.JSON);
      } catch (error) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

  4. Lưu và đặt tên cho dự án Apps Script.
  5. Triển khai dưới dạng ứng dụng web:
     - Nhấp vào "Triển khai" > "Lần triển khai mới".
     - Chọn loại là "Ứng dụng web".
     - Trong phần "Ai có quyền truy cập", chọn "Bất kỳ ai".
     - Nhấp "Triển khai".
  6. Cấp quyền cho ứng dụng khi được yêu cầu.
  7. Sao chép "URL ứng dụng web" được cung cấp.
  8. Dán URL đó vào hằng số APPS_SCRIPT_URL bên dưới để thay thế giá trị mặc định.
  =============================================================================
*/
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrSGSP0WdNZAbBk1hqNYAL4ILC4Qa3LYRYCbehb9dH7sgPYgFwOkj0C6tdwww_byeu/exec';


const App: React.FC = () => {
  const [formData, setFormData] = useState<OrderData>({
    fullName: '',
    productCode: '',
    phoneNumber: '',
    address: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // When the placeholder URL is used, simulate success for UI testing.
    if (APPS_SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL')) {
        console.warn('Đang mô phỏng việc gửi dữ liệu. Vui lòng cấu hình APPS_SCRIPT_URL trong App.tsx để lưu vào Google Sheets.');
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
            console.log('Đã gửi dữ liệu mô phỏng:', formData);
        }, 1500);
        return;
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok || result.status !== 'success') {
            throw new Error(result.message || 'Có lỗi xảy ra phía máy chủ.');
        }

        setIsSubmitted(true);
    } catch (err) {
        console.error('Lỗi khi gửi đến Google Sheets:', err);
        const errorMessage = err instanceof Error ? err.message : 'Không thể gửi đơn hàng. Vui lòng kiểm tra kết nối và thử lại.';
        setError(`Lỗi: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleNewOrder = () => {
    setFormData({
      fullName: '',
      productCode: '',
      phoneNumber: '',
      address: '',
      notes: '',
    });
    setIsSubmitted(false);
    setError(null);
  };
  
  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-600 mb-6">Cảm ơn bạn đã tin tưởng. Đơn hàng của bạn đã được ghi lại và chúng tôi sẽ xử lý sớm nhất có thể.</p>
          <button
            onClick={handleNewOrder}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Tạo đơn hàng mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex items-center justify-center mb-6">
             <div className="bg-indigo-100 p-3 rounded-full">
                <ShoppingBagIcon className="h-8 w-8 text-indigo-600"/>
             </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">Thông tin Đặt hàng</h1>
          <p className="text-center text-gray-500 mb-8">Vui lòng điền đầy đủ thông tin bên dưới.</p>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
              <div className="flex">
                <div className="py-1"><ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" /></div>
                <div>
                  <p className="font-bold">Gửi thất bại</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="fullName"
              label="Họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ví dụ: Nguyễn Văn A"
              required
            />
            <Input
              id="productCode"
              label="Mã sản phẩm"
              value={formData.productCode}
              onChange={handleChange}
              placeholder="Ví dụ: SP001"
              required
            />
            <Input
              id="phoneNumber"
              label="Số điện thoại"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Ví dụ: 0912345678"
              required
            />
            <Input
              id="address"
              label="Địa chỉ nhận hàng"
              value={formData.address}
              onChange={handleChange}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              required
            />
            <TextArea
              id="notes"
              label="Ghi chú"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ghi chú thêm về đơn hàng (ví dụ: giao hàng vào giờ hành chính)"
              rows={3}
            />
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinnerIcon className="w-5 h-5 mr-3" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi Đơn Hàng'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
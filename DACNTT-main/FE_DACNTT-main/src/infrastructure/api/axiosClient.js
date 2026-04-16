import axios from 'axios';

// Use empty string to leverage Vite's proxy configuration
const BASE_URL = '';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Attach Bearer token
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - Handle errors globally
axiosClient.interceptors.response.use(
    (response) => {
        // [QUAN TRỌNG] Nếu response là file Blob (Excel), trả về nguyên cục response
        if (response.config.responseType === 'blob') {
            return response.data;
        }
        // Các API JSON bình thường thì chỉ lấy data
        return response.data;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            // Handle Blob error (khi tải file mà bị lỗi, BE trả về JSON blob)
            if (error.config.responseType === 'blob' && data instanceof Blob) {
                // Trả về lỗi để hàm exportExcel xử lý (đọc text từ blob)
                return Promise.reject(error);
            }

            // Handle 401 Unauthorized
            if (status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // Handle 403 Forbidden
            if (status === 403) {
                console.error('Lỗi quyền truy cập :', data.message || 'You do not have permission');
            }

            return Promise.reject({
                status,
                message: data.message || data.error || 'An error occurred',
                data: data,
            });
        }

        // Handle network errors
        if (error.request) {
            return Promise.reject({
                status: 0,
                message: 'Network error. Please check your connection.',
            });
        }

        return Promise.reject({
            status: -1,
            message: error.message || 'An unexpected error occurred',
        });
    }
);

export default axiosClient;
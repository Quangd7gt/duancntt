import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls with loading and error states
 * 
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} { execute, data, loading, error, reset }
 */
export const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiFunction(...args);
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Đã xảy ra lỗi';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { execute, data, loading, error, reset };
};

/**
 * Custom hook for paginated API calls
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {number} defaultPageSize - Default page size
 * @returns {Object}
 */
export const usePaginatedApi = (apiFunction, defaultPageSize = 10) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetch = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiFunction({
                page: params.page ?? page,
                size: params.size ?? defaultPageSize,
                ...params,
            });

            // Handle different response structures
            const items = result.users || result.courses || result.data || result;
            setData(Array.isArray(items) ? items : []);
            setTotalPages(result.totalPages || 1);
            setTotal(result.total || items.length || 0);
            setPage(result.page || 0);

            return result;
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction, page, defaultPageSize]);

    const nextPage = useCallback(() => {
        if (page < totalPages - 1) {
            setPage(p => p + 1);
        }
    }, [page, totalPages]);

    const prevPage = useCallback(() => {
        if (page > 0) {
            setPage(p => p - 1);
        }
    }, [page]);

    const goToPage = useCallback((pageNum) => {
        if (pageNum >= 0 && pageNum < totalPages) {
            setPage(pageNum);
        }
    }, [totalPages]);

    const refresh = useCallback(() => {
        return fetch({ page });
    }, [fetch, page]);

    return {
        data,
        loading,
        error,
        page,
        totalPages,
        total,
        fetch,
        nextPage,
        prevPage,
        goToPage,
        refresh,
    };
};

/**
 * Custom hook for form state management
 * 
 * @param {Object} initialValues - Initial form values
 * @returns {Object}
 */
export const useForm = (initialValues = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true,
        }));
    }, []);

    const setValue = useCallback((name, value) => {
        setValues(prev => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error,
        }));
    }, []);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    const validate = useCallback((validationSchema) => {
        const newErrors = {};
        for (const [field, rules] of Object.entries(validationSchema)) {
            const value = values[field];

            if (rules.required && !value) {
                newErrors[field] = rules.message || 'Trường này không được để trống';
            } else if (rules.minLength && value && value.length < rules.minLength) {
                newErrors[field] = `Tối thiểu ${rules.minLength} ký tự`;
            } else if (rules.pattern && value && !rules.pattern.test(value)) {
                newErrors[field] = rules.message || 'Giá trị không hợp lệ';
            } else if (rules.custom && !rules.custom(value, values)) {
                newErrors[field] = rules.message || 'Giá trị không hợp lệ';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setValue,
        setFieldError,
        reset,
        validate,
        setValues,
    };
};

export default useApi;

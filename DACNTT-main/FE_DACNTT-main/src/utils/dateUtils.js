/**
 * Date Utility Functions
 * Provides consistent date formatting across the application
 */

/**
 * Format date to Vietnamese format (dd/MM/yyyy)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string (dd/MM/yyyy)
 */
export const formatDate = (dateInput) => {
    if (!dateInput) return '-';

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * [FIX] Format time to Vietnamese format (HH:mm)
 * Robust handling for ISO strings with microseconds
 * @param {string|Date} dateInput - Date string, Time string or Date object
 * @returns {string} Formatted time string (HH:mm)
 */
export const formatTime = (dateInput) => {
    if (!dateInput) return '-';

    // Trường hợp 1: Backend trả về chuỗi giờ thuần túy (VD: "07:00:00")
    // Kiểm tra nếu có dấu ':' và KHÔNG có 'T' (không phải ISO date)
    if (typeof dateInput === 'string' && dateInput.includes(':') && !dateInput.includes('T')) {
        const parts = dateInput.split(':');
        if (parts.length >= 2) {
            return `${parts[0]}:${parts[1]}`; // Lấy HH:mm, bỏ giây
        }
    }

    // Trường hợp 2: Backend trả về ISO Date (VD: 2025-12-24T11:24:02.104782)
    const date = new Date(dateInput);
    
    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) {
        return '-'; 
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
};

/**
 * Format datetime to Vietnamese format (dd/MM/yyyy HH:mm)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateInput) => {
    if (!dateInput) return '-';

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';

    return `${formatDate(dateInput)} ${formatTime(dateInput)}`;
};

export default {
    formatDate,
    formatTime,
    formatDateTime,
};
import { clsx } from 'clsx';

/**
 * DateInput Component
 * Simple date input that displays dates in dd/MM/yyyy format
 * Uses native date input with custom formatting display
 */
const DateInput = ({
    name,
    label,
    value,
    onChange,
    required = false,
    error,
    className = '',
    ...rest
}) => {
    // Convert date string to dd/MM/yyyy format for display label
    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const displayDate = formatDisplayDate(value);

    return (
        <div className={clsx('w-full', className)}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {/* Native date input - simple and fast */}
                <input
                    type="date"
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={clsx(
                        'block w-full px-4 py-3 rounded-xl border transition-colors',
                        'bg-gray-50 focus:bg-white',
                        error
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200',
                        'text-gray-900',
                        'focus:outline-none'
                    )}
                    {...rest}
                />
            </div>
            {/* Show formatted date below for clarity */}
            {displayDate && (
                <p className="mt-1 text-xs text-indigo-600 font-medium">
                    📅 {displayDate}
                </p>
            )}
            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default DateInput;

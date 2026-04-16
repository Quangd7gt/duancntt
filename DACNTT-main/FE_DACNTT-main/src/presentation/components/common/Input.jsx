import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Input Component
 * Reusable form input with validation styling
 */
const Input = ({
    id,
    name,
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    required = false,
    disabled = false,
    className = '',
    inputClassName = '',
    icon = null,
    iconPosition = 'left',
    ...props
}) => {
    const hasError = !!error;

    const inputBaseStyles = 'block w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';

    const inputStateStyles = hasError
        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-200 hover:border-gray-400';

    const inputDisabledStyles = disabled && 'bg-gray-100 cursor-not-allowed opacity-75';

    const inputWithIconStyles = icon && iconPosition === 'left' ? 'pl-11' : icon && iconPosition === 'right' ? 'pr-11' : '';

    const inputClasses = twMerge(
        clsx(
            inputBaseStyles,
            inputStateStyles,
            inputDisabledStyles,
            inputWithIconStyles,
            inputClassName
        )
    );

    return (
        <div className={twMerge('mb-4', className)}>
            {label && (
                <label
                    htmlFor={id || name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && iconPosition === 'left' && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    id={id || name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={inputClasses}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${name}-error` : undefined}
                    {...props}
                />
                {icon && iconPosition === 'right' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
            {hasError && (
                <p
                    id={`${name}-error`}
                    className="mt-2 text-sm text-red-600 flex items-center"
                >
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </p>
            )}
            {!hasError && helperText && (
                <p className="mt-2 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

/**
 * Select Component
 * Reusable select dropdown
 */
export const Select = ({
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
    options = [],
    placeholder = 'Chọn...',
    error,
    required = false,
    disabled = false,
    className = '',
    ...props
}) => {
    const hasError = !!error;

    const selectStyles = clsx(
        'block w-full rounded-lg border px-4 py-3 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-no-repeat bg-right pr-10',
        hasError
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-200 hover:border-gray-400',
        disabled && 'bg-gray-100 cursor-not-allowed opacity-75'
    );

    return (
        <div className={twMerge('mb-4', className)}>
            {label && (
                <label
                    htmlFor={id || name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    id={id || name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    required={required}
                    className={selectStyles}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1.5em 1.5em',
                    }}
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {hasError && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

/**
 * Textarea Component
 */
export const Textarea = ({
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    required = false,
    disabled = false,
    rows = 4,
    className = '',
    ...props
}) => {
    const hasError = !!error;

    const textareaStyles = clsx(
        'block w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none',
        hasError
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-200 hover:border-gray-400',
        disabled && 'bg-gray-100 cursor-not-allowed opacity-75'
    );

    return (
        <div className={twMerge('mb-4', className)}>
            {label && (
                <label
                    htmlFor={id || name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                id={id || name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                rows={rows}
                className={textareaStyles}
                {...props}
            />
            {hasError && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default Input;

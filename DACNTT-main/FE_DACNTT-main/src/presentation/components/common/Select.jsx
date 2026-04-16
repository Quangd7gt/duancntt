/**
 * Select Component
 * Styled dropdown select
 */
const Select = ({
    name,
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Chọn...',
    required = false,
    disabled = false,
    error,
    className = '',
}) => {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`
                    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                    ${error
                        ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                        : 'border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500'
                    }
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    text-gray-900 text-sm
                `}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default Select;

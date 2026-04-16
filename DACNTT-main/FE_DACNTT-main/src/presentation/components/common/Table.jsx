import { clsx } from 'clsx';

/**
 * Table Component
 * Reusable data table with sorting and styling
 */
const Table = ({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = 'Không có dữ liệu',
    className = '',
    striped = true,
    hoverable = true,
    compact = false,
    onRowClick,
}) => {
    const tableWrapperStyles = 'w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm';

    const tableStyles = 'w-full text-left';

    const thStyles = clsx(
        'bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200',
        compact ? 'px-4 py-2 text-xs' : 'px-6 py-4 text-xs'
    );

    const tdStyles = clsx(
        'text-gray-700 border-b border-gray-100',
        compact ? 'px-4 py-2 text-sm' : 'px-6 py-4 text-sm'
    );

    const LoadingRow = () => (
        <tr>
            <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
                    </div>
                    <span className="text-gray-500 font-medium">Đang tải dữ liệu...</span>
                </div>
            </td>
        </tr>
    );

    const EmptyRow = () => (
        <tr>
            <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                    <span className="text-gray-500 font-medium">{emptyMessage}</span>
                </div>
            </td>
        </tr>
    );

    return (
        <div className={clsx(tableWrapperStyles, className)}>
            <table className={tableStyles}>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={column.key || index}
                                className={clsx(thStyles, column.className)}
                                style={{ width: column.width }}
                            >
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <LoadingRow />
                    ) : data.length === 0 ? (
                        <EmptyRow />
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className={clsx(
                                    'transition-colors duration-150',
                                    striped && rowIndex % 2 === 1 && 'bg-gray-50',
                                    hoverable && 'hover:bg-indigo-50',
                                    onRowClick && 'cursor-pointer'
                                )}
                                onClick={() => onRowClick?.(row, rowIndex)}
                            >
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={column.key || colIndex}
                                        className={clsx(tdStyles, column.cellClassName)}
                                    >
                                        {column.render
                                            ? column.render(row[column.dataIndex], row, rowIndex)
                                            : row[column.dataIndex]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

/**
 * Pagination Component
 */
export const Pagination = ({
    currentPage = 0,
    totalPages = 1,
    onPageChange,
    className = '',
}) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    const buttonBaseStyles = 'px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';

    return (
        <div className={clsx('flex items-center justify-center space-x-1 mt-4', className)}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={clsx(
                    buttonBaseStyles,
                    'rounded-l-lg border border-gray-300',
                    currentPage === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {startPage > 0 && (
                <>
                    <button
                        onClick={() => onPageChange(0)}
                        className={clsx(buttonBaseStyles, 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50')}
                    >
                        1
                    </button>
                    {startPage > 1 && (
                        <span className="px-3 py-2 text-gray-500">...</span>
                    )}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={clsx(
                        buttonBaseStyles,
                        'border',
                        page === currentPage
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    )}
                >
                    {page + 1}
                </button>
            ))}

            {endPage < totalPages - 1 && (
                <>
                    {endPage < totalPages - 2 && (
                        <span className="px-3 py-2 text-gray-500">...</span>
                    )}
                    <button
                        onClick={() => onPageChange(totalPages - 1)}
                        className={clsx(buttonBaseStyles, 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50')}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className={clsx(
                    buttonBaseStyles,
                    'rounded-r-lg border border-gray-300',
                    currentPage === totalPages - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default Table;

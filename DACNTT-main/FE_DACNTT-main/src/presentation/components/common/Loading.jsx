import { clsx } from 'clsx';

/**
 * Loading Spinner Component
 */
const Loading = ({
    size = 'md',
    color = 'primary',
    text,
    fullScreen = false,
    className = '',
}) => {
    const sizes = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-14 h-14 border-4',
        xl: 'w-20 h-20 border-4',
    };

    const colors = {
        primary: 'border-indigo-600',
        white: 'border-white',
        gray: 'border-gray-600',
    };

    const Spinner = () => (
        <div className={clsx('flex flex-col items-center justify-center', className)}>
            <div
                className={clsx(
                    'rounded-full border-gray-200 animate-spin',
                    sizes[size],
                    'border-t-transparent',
                    colors[color]
                )}
                style={{
                    borderTopColor: 'transparent',
                }}
            />
            {text && (
                <p className={clsx(
                    'mt-4 font-medium',
                    color === 'white' ? 'text-white' : 'text-gray-600'
                )}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <Spinner />
            </div>
        );
    }

    return <Spinner />;
};

/**
 * Skeleton Loading Component
 */
export const Skeleton = ({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1,
}) => {
    const variants = {
        text: 'h-4 rounded',
        title: 'h-6 rounded w-3/4',
        avatar: 'h-12 w-12 rounded-full',
        thumbnail: 'h-24 w-24 rounded-lg',
        card: 'h-48 rounded-xl',
        rectangle: 'rounded-lg',
    };

    const baseStyles = 'bg-gray-200 animate-pulse';

    const items = Array.from({ length: count }, (_, i) => i);

    return (
        <>
            {items.map((index) => (
                <div
                    key={index}
                    className={clsx(baseStyles, variants[variant], className)}
                    style={{
                        width: width,
                        height: variant === 'rectangle' ? height : undefined,
                    }}
                />
            ))}
        </>
    );
};

/**
 * Page Loading Component
 */
export const PageLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-200"></div>
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang tải...</h2>
            <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
        </div>
    </div>
);

/**
 * Card Loading Component
 */
export const CardLoading = ({ count = 1 }) => (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                    <Skeleton variant="avatar" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-3/4" />
                        <Skeleton variant="text" className="w-1/2" />
                    </div>
                </div>
                <Skeleton variant="text" count={3} className="mb-2" />
                <div className="flex justify-end mt-4 space-x-2">
                    <Skeleton variant="rectangle" width={80} height={32} />
                    <Skeleton variant="rectangle" width={80} height={32} />
                </div>
            </div>
        ))}
    </div>
);

export default Loading;

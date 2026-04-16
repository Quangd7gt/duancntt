import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { Alert } from '../components/common/Card';

/**
 * LoginPage Component
 * User login page
 */
const LoginPage = () => {
    const { login, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.password) {
            setError('Vui lòng nhập tên đăng nhập và mật khẩu');
            return;
        }

        try {
            await login(formData.username, formData.password);
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-6 text-center">
                Đăng nhập
            </h2>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    onClose={() => setError('')}
                    className="mb-4"
                />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-2">
                        Tên đăng nhập
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Nhập tên đăng nhập"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        autoComplete="username"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-2">
                        Mật khẩu
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        autoComplete="current-password"
                    />
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isLoading}
                    // Style mới: Nền trắng, chữ tím đậm, đổ bóng
                    className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 shadow-lg transition-all duration-200"
                >
                    Đăng nhập
                </Button>
            </form>
        </div>
    );
};

export default LoginPage;
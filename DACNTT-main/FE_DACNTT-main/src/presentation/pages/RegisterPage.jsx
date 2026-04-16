import { Link } from 'react-router-dom';
import { Alert } from '../components/common/Card';

/**
 * RegisterPage Component
 * [UPDATED] Student registration page is disabled.
 */
const RegisterPage = () => {
    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-6 text-center">
                Đăng ký tài khoản
            </h2>

            <Alert
                type="warning"
                message="Chức năng đăng ký trực tuyến tạm thời bị vô hiệu hóa hoặc không dành cho sinh viên tự đăng ký."
                className="mb-6"
            />

            <div className="bg-white/10 rounded-xl p-6 text-center border border-white/20">
                <p className="text-indigo-100 mb-4">
                    Vui lòng liên hệ với <strong>Phòng Đào Tạo</strong> hoặc <strong>Giảng viên chủ nhiệm</strong> để được cấp tài khoản.
                </p>
                
                <Link
                    to="/login"
                    className="inline-block px-6 py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                >
                    Quay lại Đăng nhập
                </Link>
            </div>
        </div>
    );
};

export default RegisterPage;
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMeUseCase } from '../../../usecases/users/userUseCases';

const ProfilePage = () => {
    const { user: authUser } = useAuth(); // Lấy thông tin sơ bộ từ Context (để fallback)
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Gọi API lấy thông tin chi tiết mới nhất từ Server
                const userData = await getMeUseCase();
                setProfile(userData);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                // Nếu API lỗi, dùng tạm thông tin từ AuthContext (để không trắng trang)
                setProfile(authUser); 
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [authUser]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return null;

    // Helper để hiển thị role đẹp hơn
    const getRoleLabel = (role) => {
        if (!role) return 'N/A';
        const roles = {
            'ADMIN': 'Quản trị viên',
            'LECTURER': 'Giảng viên',
            'STUDENT': 'Sinh viên'
        };
        const normalizedRole = role.replace('ROLE_', '');
        return roles[normalizedRole] || normalizedRole;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="relative pt-12 px-4 flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
                    {/* Avatar Placeholder */}
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 shadow-md">
                        <span>
                            {profile.firstName ? profile.firstName.charAt(0) : ''}
                            {profile.lastName ? profile.lastName.charAt(0) : ''}
                        </span>
                    </div>
                    
                    {/* Name & Role */}
                    <div className="flex-1 text-center md:text-left pb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{profile.lastName} {profile.firstName}</h1>
                        <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                                {getRoleLabel(profile.role)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${profile.enabled ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                {profile.enabled ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Thông tin chi tiết</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột trái: Thông tin cơ bản */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500 block">Tên đăng nhập</label>
                            <p className="text-gray-900 font-medium mt-1 p-2 bg-gray-50 rounded-lg">{profile.username}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 block">Email</label>
                            <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded-lg">{profile.email}</p>
                        </div>
                    </div>

                    {/* Cột phải: Thông tin theo Role */}
                    <div className="space-y-4">
                        {profile.studentCode && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 block">Mã sinh viên</label>
                                <p className="text-gray-900 font-medium mt-1 font-mono p-2 bg-gray-50 rounded-lg">{profile.studentCode}</p>
                            </div>
                        )}
                        {profile.lecturerCode && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 block">Mã giảng viên</label>
                                <p className="text-gray-900 font-medium mt-1 font-mono p-2 bg-gray-50 rounded-lg">{profile.lecturerCode}</p>
                            </div>
                        )}
                        
                        {profile.department && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 block">Khoa / Viện</label>
                                <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded-lg">{profile.department}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
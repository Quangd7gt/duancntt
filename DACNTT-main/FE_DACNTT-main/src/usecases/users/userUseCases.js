import { getUserRepository } from '../../domain/repositories/RepositoryFactory';
import { User } from '../../domain/models/User';

const userRepository = getUserRepository();

export const createUserUseCase = async (userData) => {
    const requiredFields = ['username', 'password', 'email', 'fullName', 'role'];
    for (const field of requiredFields) {
        if (!userData[field]) {
            throw new Error(`${field} không được để trống`);
        }
    }

    // Danh sách role hợp lệ (bao gồm Secretary)
    const validRoles = ['ADMIN', 'LECTURER', 'STUDENT', 'SECRETARY'];
    
    if (!validRoles.includes(userData.role)) {
        throw new Error('Role không hợp lệ');
    }

    if (userData.role === 'LECTURER' && !userData.lecturerCode) {
        throw new Error('Mã giảng viên không được để trống');
    }

    if (userData.role === 'STUDENT' && !userData.studentCode) {
        throw new Error('Mã sinh viên không được để trống');
    }

    const response = await userRepository.createUser(userData);
    return User.fromApi(response);
};

// [FIX TRIỆT ĐỂ] Logic lọc thông minh tại Frontend
export const getUsersUseCase = async (params = {}) => {
    // 1. Gọi API (truyền params xuống repo)
    const response = await userRepository.getUsers(params);
    const content = response.content || response.data || response;
    
    // 2. Chuyển đổi dữ liệu
    let users = Array.isArray(content)
        ? content.map(u => User.fromApi(u))
        : [];

    // 3. Lọc dữ liệu (Client-side Filtering)
    // Đoạn này khắc phục việc BE trả về thừa hoặc định dạng role khác nhau
    if (params.role) {
        const targetRole = params.role.toString().toUpperCase(); // Ví dụ: "LECTURER"
        
        users = users.filter(u => {
            const currentRole = (u.role || '').toString().toUpperCase();
            
            // Chấp nhận cả 2 trường hợp:
            // 1. Khớp chính xác: "ROLE_LECTURER" === "ROLE_LECTURER"
            // 2. Khớp chứa chuỗi: "ROLE_LECTURER" chứa "LECTURER"
            return currentRole === targetRole || 
                   currentRole === `ROLE_${targetRole}` ||
                   currentRole.includes(targetRole);
        });
    }

    return {
        users,
        total: response.totalElements || users.length,
        page: response.number || 0,
        totalPages: response.totalPages || 1,
    };
};

export const getUserByIdUseCase = async (userId) => {
    if (!userId) throw new Error('ID người dùng không được để trống');
    const response = await userRepository.getUserById(userId);
    return User.fromApi(response);
};

export const updateUserUseCase = async (userId, userData) => {
    if (!userId) throw new Error('ID người dùng không được để trống');
    const response = await userRepository.updateUser(userId, userData);
    return User.fromApi(response);
};

export const deleteUserUseCase = async (userId) => {
    if (!userId) throw new Error('ID người dùng không được để trống');
    await userRepository.deleteUser(userId);
};

export const resetPasswordUseCase = async (username) => {
    if (!username) throw new Error('Tên đăng nhập không được để trống');
    const response = await userRepository.resetPassword(username);
    return response;
};

export const getMeUseCase = async () => {
    const response = await userRepository.getMe();
    return User.fromApi(response);
};

const userUseCases = {
    createUser: createUserUseCase,
    getUsers: getUsersUseCase,
    getUserById: getUserByIdUseCase,
    updateUser: updateUserUseCase,
    deleteUser: deleteUserUseCase,
    resetPassword: resetPasswordUseCase,
    getMe: getMeUseCase,
};

export default userUseCases;
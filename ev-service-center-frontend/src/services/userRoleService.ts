import { httpClient } from "@/lib/httpClient";

export interface UserRole {
    id: string;
    userId: string;
    roleId: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    role?: {
        id: string;
        name: string;
    };
}

export interface CreateUserRoleDto {
    userId: string;
    roleId: string;
}

export interface UpdateUserRoleDto {
    userId?: string;
    roleId?: string;
}

interface AuthUser {
    id: number | string;
    username?: string;
    email: string;
    userRoles?: Array<{
        role: {
            name: string;
        };
    }>;
    createdAt?: string;
    updatedAt?: string;
}

const getPrimaryRole = (user: AuthUser): string => {
    return user.userRoles?.[0]?.role?.name || "user";
};

const mapUserToUserRole = (user: AuthUser, roleName = getPrimaryRole(user)): UserRole => {
    const userId = String(user.id);

    return {
        id: `${userId}:${roleName}`,
        userId,
        roleId: roleName,
        createdAt: user.createdAt || "",
        updatedAt: user.updatedAt || "",
        user: {
            id: userId,
            name: user.username || user.email,
            email: user.email,
        },
        role: {
            id: roleName,
            name: roleName,
        },
    };
};

const getUsersFromResponse = (responseData: AuthUser[] | { data?: AuthUser[] }): AuthUser[] => {
    if (Array.isArray(responseData)) {
        return responseData;
    }

    return responseData.data || [];
};

const parseUserRoleId = (id: string): { userId: string; roleId?: string } => {
    const [userId, roleId] = id.split(":");
    return { userId, roleId };
};

export const getUserRoles = async (): Promise<UserRole[]> => {
    const res = await httpClient.get("/api/auth/users", {
        params: { page: 1, limit: 100 },
    });
    return getUsersFromResponse(res.data).map((user) => mapUserToUserRole(user));
};

export const getUserRoleById = async (id: string): Promise<UserRole> => {
    const { userId, roleId } = parseUserRoleId(id);
    const userRoles = await getUserRolesByUserId(userId);
    const userRole = roleId
        ? userRoles.find((item) => item.roleId === roleId)
        : userRoles[0];

    if (!userRole) {
        throw new Error("User role not found");
    }

    return userRole;
};

export const getUserRolesByUserId = async (userId: string): Promise<UserRole[]> => {
    const res = await httpClient.get(`/api/auth/users/${userId}`);
    return [mapUserToUserRole(res.data)];
};

export const createUserRole = async (data: CreateUserRoleDto): Promise<UserRole> => {
    const res = await httpClient.patch(`/api/auth/users/${data.userId}`, {
        roles: [data.roleId],
    });
    return mapUserToUserRole(res.data, data.roleId);
};

export const updateUserRole = async (id: string, data: UpdateUserRoleDto): Promise<UserRole> => {
    const parsed = parseUserRoleId(id);
    const userId = data.userId || parsed.userId;
    const roleId = data.roleId || parsed.roleId || "user";
    const res = await httpClient.patch(`/api/auth/users/${userId}`, {
        roles: [roleId],
    });
    return mapUserToUserRole(res.data, roleId);
};

export const deleteUserRole = async (id: string): Promise<void> => {
    const { userId } = parseUserRoleId(id);
    await httpClient.patch(`/api/auth/users/${userId}`, {
        roles: ["user"],
    });
};

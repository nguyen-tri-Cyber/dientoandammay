import { UserRoleOptions } from "@/constants/user.constant";

export interface Role {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

const STATIC_DATE = new Date(0).toISOString();

const roles: Role[] = UserRoleOptions.map((role) => ({
    id: role.value,
    name: role.value,
    createdAt: STATIC_DATE,
    updatedAt: STATIC_DATE,
}));

const unsupportedRoleMutation = (): never => {
    throw new Error("Roles are managed as fixed values on users in auth-service");
};

export const getRoles = async (): Promise<Role[]> => roles;

export const getRoleById = async (id: string): Promise<Role> => {
    const role = roles.find((item) => item.id === id || item.name === id);
    if (!role) {
        throw new Error("Role not found");
    }
    return role;
};

export const createRole = async (data: {
    name: string;
}): Promise<Role> => {
    void data;
    return unsupportedRoleMutation();
};

export const updateRole = async (id: string, data: {
    name?: string;
}): Promise<Role> => {
    void id;
    void data;
    return unsupportedRoleMutation();
};

export const deleteRole = async (id: string): Promise<void> => {
    void id;
    return unsupportedRoleMutation();
};

export interface CreateRoleDto {
    name: string;
}

export interface UpdateRoleDto {
    name?: string;
}

export enum UserRole {
  SystemAdmin = 'SYSTEM_ADMIN',
  StoreAdmin = 'STORE_ADMIN',
  Client = 'CLIENT',
}
export const roleLabels: Record<string, string> = {
  SYSTEM_ADMIN: 'Admin del sistema',
  STORE_ADMIN: 'Admin de tienda',
  CLIENT: 'Cliente',
};

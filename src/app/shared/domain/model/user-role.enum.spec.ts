import { UserRole, roleLabels } from './user-role.enum';

describe('UserRole enum y roleLabels', () => {
  it('expone los 3 roles que entiende el backend', () => {
    expect(UserRole.SystemAdmin).toBe('SYSTEM_ADMIN');
    expect(UserRole.StoreAdmin).toBe('STORE_ADMIN');
    expect(UserRole.Client).toBe('CLIENT');
  });

  it('tiene etiqueta en espanol para cada rol', () => {
    expect(roleLabels[UserRole.SystemAdmin]).toBe('Admin del sistema');
    expect(roleLabels[UserRole.StoreAdmin]).toBe('Admin de tienda');
    expect(roleLabels[UserRole.Client]).toBe('Cliente');
  });

  it('cubre todos los valores del enum sin huecos', () => {
    for (const value of Object.values(UserRole)) {
      expect(roleLabels[value]).toBeDefined();
    }
  });
});

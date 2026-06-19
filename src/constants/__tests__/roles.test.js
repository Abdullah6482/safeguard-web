import { hasPermission, Roles } from '../roles';

describe('RBAC Roles and Permissions', () => {
  test('admin has delete permissions', () => {
    expect(hasPermission(Roles.ADMIN, 'delete_report')).toBe(true);
  });

  test('reviewer cannot delete reports', () => {
    expect(hasPermission(Roles.REVIEWER, 'delete_report')).toBe(false);
  });
});

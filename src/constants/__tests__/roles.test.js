import { hasPermission, Roles } from '../roles';

describe('RBAC Roles and Permissions', () => {
  test('manager can submit manager decisions', () => {
    expect(hasPermission(Roles.MANAGER, 'manager_decision')).toBe(true);
  });

  test('reporter cannot submit manager decisions', () => {
    expect(hasPermission(Roles.REPORTER, 'manager_decision')).toBe(false);
  });
});

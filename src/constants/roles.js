export const Roles = {
  MANAGER: 'manager',
  INVESTIGATOR: 'investigator',
  REPORTER: 'reporter',
};

export const Permissions = {
  [Roles.MANAGER]: ['read_reports', 'manager_decision', 'manage_capa', 'export_data'],
  [Roles.INVESTIGATOR]: ['read_reports', 'investigate_report', 'manage_capa'],
  [Roles.REPORTER]: ['create_report', 'read_own_reports'],
};

export function hasPermission(role, permission) {
  const perms = Permissions[role] || [];
  return perms.includes(permission);
}

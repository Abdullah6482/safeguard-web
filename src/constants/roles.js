export const Roles = {
  ADMIN: 'admin',
  INVESTIGATOR: 'investigator',
  REVIEWER: 'reviewer',
};

export const Permissions = {
  [Roles.ADMIN]: ['create_report', 'edit_report', 'delete_report', 'manage_users', 'export_data'],
  [Roles.INVESTIGATOR]: ['create_report', 'edit_report', 'close_capa', 'export_data'],
  [Roles.REVIEWER]: ['create_report', 'read_reports'],
};

export function hasPermission(role, permission) {
  const perms = Permissions[role] || [];
  return perms.includes(permission);
}

import React from 'react';
import { hasPermission } from '../../constants/roles';

export default function PermissionGuard({ userRole, requiredPermission, children, fallback = null }) {
  if (hasPermission(userRole, requiredPermission)) {
    return children;
  }
  return fallback;
}

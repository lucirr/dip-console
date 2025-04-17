'use client';

import { useState } from 'react';
import SysCatalogTypesPage from '../sys-catalog-types/page';

export default function CatalogTypesPage() {
  // Boolean parameter to control admin view
  const [isAdminView, setIsAdminView] = useState<boolean>(true);

  return (
    <div>
      <SysCatalogTypesPage isAdminView={isAdminView} />
    </div>
  );
}

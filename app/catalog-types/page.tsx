'use client';

import { useState } from 'react';
import SysCatalogTypesPage from '@/components/catalog-type';

export default function CatalogTypesPage() {
  const [isAdminView, setIsAdminView] = useState<boolean>(true);

  return (
    <div>
      <SysCatalogTypesPage isAdminView={isAdminView} />
    </div>
  );
}

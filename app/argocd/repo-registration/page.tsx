'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ArgoRepoRegistrationPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">ArgoCD Repo 등록</h2>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Repo 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">ArgoCD Repo 등록 내용이 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
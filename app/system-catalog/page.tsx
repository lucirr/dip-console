'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Globe, Calendar, Users, RefreshCcw } from 'lucide-react';
import { Plus, Search, RotateCcw, Link as LinkIcon, Info, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import Image from 'next/image';
import { SystemLink } from '@/types/systemlink';
import { getSystemLink, insertSystemLink, updateSystemLink, deleteSystemLink } from "@/lib/actions"
import SystemCatalogLinkPage from '@/components/system-catalog-link';



export default function SystemCatalogPage() {
  const [systemLinkData, setSystemLinkData] = useState<SystemLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("view");


  const fetchSystemLink = async () => {
    setIsLoading(true);
    try {
      const response = await getSystemLink();

      const filteredData = response.filter(item =>
        item.enable
      );

      setSystemLinkData(filteredData);
    } catch (error) {
      setSystemLinkData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    fetchSystemLink();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const extractImageUrl = (htmlString: string) => {
    if (htmlString) {
      return htmlString;
    }
    return '';
    // try {
    //   // 이스케이프된 문자열 디코딩
    //   const decodedString = htmlString.replace(/\\u003c/g, '<')
    //     .replace(/\\u003e/g, '>')
    //     .replace(/\\"/g, '"');

    //   const parser = new DOMParser();
    //   const doc = parser.parseFromString(decodedString, 'text/html');
    //   const imgElement = doc.querySelector('img');
    //   return imgElement?.getAttribute('src') || '';
    // } catch (error) {
    //   console.error('Error parsing HTML:', error);
    //   return '';
    // }
  };

  const handleImageError = (itemId: string | undefined) => {
    if (!itemId) return; // Skip if itemId is undefined
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleRefresh = () => {
    fetchSystemLink();
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4 pt-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">시스템 카탈로그</h2>
            <p className="mt-1 text-sm text-gray-500">시스템 카탈로그를 조회하고 관리할 수 있습니다.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Tabs defaultValue="view" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">

            <TabsList>
              <TabsTrigger value="view">조회</TabsTrigger>
              <TabsTrigger value="create">생성</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="view" className="space-y-4 mt-4">
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                새로고침
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {systemLinkData.map((item, index) => (
                <Card key={item.uid} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full flex items-center justify-center bg-gray-100">
                    <div className={`relative ${index === 0 ? 'w-1/2 h-24' : 'w-1/2 h-24'}`}>
                      {extractImageUrl(item.image) && !(item.uid && imageErrors[item.uid]) ? (
                        <Image
                          src={extractImageUrl(item.image)}
                          alt={item.systemName}
                          className="object-contain"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={() => handleImageError(item.uid)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <Server className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{item.systemName}</CardTitle>
                    </div>
                    <CardDescription>{item.linkUrl}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2 p-4">
                    <Button variant="outline" size="sm" onClick={() => handleClick(item.linkUrl)}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      링크
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <div>
              <SystemCatalogLinkPage
                title={null} description={null}
                containerClassName="flex-1 space-y-4"
                headerClassName="bg-white -mx-4"
                contentClassName="flex items-center justify-between px-6"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
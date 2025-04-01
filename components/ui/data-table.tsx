import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Column {
  key: string;
  title: string;
  width?: string;
  align?: string;
  cell?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRefresh?: () => void;
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export function DataTable({ columns, data, onRefresh, isLoading, pagination }: DataTableProps) {
  const pageSizeOptions = [10, 20, 30, 50];
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  return (
    <div className="space-y-4">
      {onRefresh && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-muted">
              <tr className="border-b transition-colors">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`h-10 px-4 text-left align-middle font-medium text-muted-foreground ${column.width || ''}`}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data?.length ? (
               data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="h-10 px-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      {column.cell ? column.cell(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
              ) : (
              <tr>
                <td colSpan={columns.length} className="h-20 text-center">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              페이지당 행:
            </p>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              {`${pagination.page} / ${totalPages}`}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              >
                다음
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
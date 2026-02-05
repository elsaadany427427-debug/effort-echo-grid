 import { ChevronLeft, ChevronRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 
 interface TaskPaginationProps {
   currentPage: number;
   totalPages: number;
   pageSize: number;
   totalItems: number;
   onPageChange: (page: number) => void;
   onPageSizeChange: (size: number) => void;
 }
 
 export function TaskPagination({
   currentPage,
   totalPages,
   pageSize,
   totalItems,
   onPageChange,
   onPageSizeChange,
 }: TaskPaginationProps) {
   const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
   const endItem = Math.min(currentPage * pageSize, totalItems);
 
   const getVisiblePages = () => {
     const pages: (number | string)[] = [];
     const maxVisible = 5;
     
     if (totalPages <= maxVisible) {
       for (let i = 1; i <= totalPages; i++) pages.push(i);
     } else {
       if (currentPage <= 3) {
         for (let i = 1; i <= 4; i++) pages.push(i);
         pages.push('...');
         pages.push(totalPages);
       } else if (currentPage >= totalPages - 2) {
         pages.push(1);
         pages.push('...');
         for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
       } else {
         pages.push(1);
         pages.push('...');
         pages.push(currentPage - 1);
         pages.push(currentPage);
         pages.push(currentPage + 1);
         pages.push('...');
         pages.push(totalPages);
       }
     }
     
     return pages;
   };
 
   if (totalItems === 0) return null;
 
   return (
     <div className="flex items-center justify-between px-2 py-4">
       <div className="flex items-center gap-2 text-sm text-muted-foreground">
         <span>Showing {startItem}-{endItem} of {totalItems} tasks</span>
         <Select
           value={pageSize.toString()}
           onValueChange={(value) => onPageSizeChange(Number(value))}
         >
           <SelectTrigger className="h-8 w-[70px]">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="10">10</SelectItem>
             <SelectItem value="25">25</SelectItem>
             <SelectItem value="50">50</SelectItem>
           </SelectContent>
         </Select>
         <span>per page</span>
       </div>
 
       <div className="flex items-center gap-1">
         <Button
           variant="outline"
           size="icon"
           className="h-8 w-8"
           onClick={() => onPageChange(currentPage - 1)}
           disabled={currentPage === 1}
         >
           <ChevronLeft className="h-4 w-4" />
         </Button>
         
         {getVisiblePages().map((page, index) => (
           typeof page === 'number' ? (
             <Button
               key={index}
               variant={page === currentPage ? 'default' : 'outline'}
               size="icon"
               className="h-8 w-8"
               onClick={() => onPageChange(page)}
             >
               {page}
             </Button>
           ) : (
             <span key={index} className="px-2 text-muted-foreground">...</span>
           )
         ))}
         
         <Button
           variant="outline"
           size="icon"
           className="h-8 w-8"
           onClick={() => onPageChange(currentPage + 1)}
           disabled={currentPage === totalPages}
         >
           <ChevronRight className="h-4 w-4" />
         </Button>
       </div>
     </div>
   );
 }
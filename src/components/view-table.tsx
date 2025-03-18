import { cn } from "@/lib/utils";
import React from 'react'

type Column = {
  key: string;
  header: string;
  width?: string; 
  tdClassName?: string;
  thClassName?: string;
  render?: (value: any, record: any) => React.ReactNode;
}

type ViewTableProps = {
  columns: Column[];
  data: any[];
  className?: string;
}

export default function ViewTable({ columns, data, className = '' }: ViewTableProps) {
  return (
    <div className="overflow-x-auto border border-primary rounded-2xl">
      <table className={cn("w-full", className)}>
        <colgroup>
          {columns.map((column, index) => (
            <col 
              key={index} 
              style={{ width: column.width || 'auto' }} 
            />
          ))}
        </colgroup>
        <thead>
          <tr className="bg-primary-dark text-primary-dark-foreground font-nunito">
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={cn(
                  "py-9 px-5 text-lg text-center border-b border-r border-primary [&:last-child]:border-r-0 font-bold",
                  column.thClassName
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, rowIndex) => (
            <tr 
              key={rowIndex}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex} 
                  className={cn(
                    "px-3 py-9 text-base  border-r border-t border-primary [&:last-child]:border-r-0 font-bold",
                    column.tdClassName
                  )}
                >
                  {column.render 
                    ? column.render(record[column.key], record)
                    : record[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

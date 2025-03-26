/**
 * Sort data table by column
 * @param data 
 * @param column 
 * @param isAscending 
 * @returns 
 */
export function sortDataTable<T>(
    data: T[],
    column: keyof T,
    isAscending: boolean
  ): T[] {
    return [...data].sort((a, b) => {
      const valueA = column === 'created_at' ? new Date(a[column] as any).getTime() : a[column];
      const valueB = column === 'created_at' ? new Date(b[column] as any).getTime() : b[column];
  
      if (valueA < valueB) return isAscending ? -1 : 1;
      if (valueA > valueB) return isAscending ? 1 : -1;
      return 0;
    });
  }
  /**
   * Toggle sort Icon 
   * @param currentSortColumn 
   * @param isAscending 
   * @param column 
   * @returns 
   */
  export function toggleSortIcon<T>(
    currentSortColumn: keyof T | null,
    isAscending: boolean,
    column: keyof T
  ): string {
    if (currentSortColumn !== column) {
      return ''; // Unsorted columns don't require icon to be shown
    }
    return isAscending ?  '▲' : '▼';
  }
export type FilterParams = {
  page?: number,
  limit?:number,
  filterColumn?: string, 
  filterValue?: string | number,
  type?: 'all'| 'drinks' | 'fast_food' | 'snacks'
}
export type ProductListProps = {
    paginationProductTypeAll: any | null;
    paginationProductTypeFastFood: any | null;
    paginationProductTypeDrinks: any | null;
    paginationProductTypeSnacks: any | null;
  
    hasFetchedPaginationProductTypeAll: boolean;
    hasFetchedPaginationProductTypeFastFood: boolean;
    hasFetchedPaginationProductTypeDrinks: boolean;
    hasFetchedPaginationProductTypeSnacks: boolean;
  
    hasMorePaginationProductTypeAll: boolean;
    hasMorePaginationProductTypeFastFood: boolean;
    hasMorePaginationProductTypeDrinks: boolean;
    hasMorePaginationProductTypeSnacks: boolean;
  
    currentPagePaginationProductTypeAll: number;
    currentPagePaginationProductTypeFastFood: number;
    currentPagePaginationProductTypeDrinks: number;
    currentPagePaginationProductTypeSnacks: number;

  
    productListError: any | null;
    productListLoading: boolean;
  };
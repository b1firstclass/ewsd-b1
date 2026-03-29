# Reusable Table

Use `src/components/common/AppDataTable.tsx` for server-driven admin lists that share the same shell:

- card container
- controlled search input
- filter and action slots
- inline error state with retry
- loading state
- empty state
- result summary
- pagination footer

Keep these concerns in the feature page or feature hook:

- API calls and TanStack Query state
- debounce logic for search params
- server-side pagination params
- dialogs, forms, and row mutations
- toasts and mutation error handling
- feature-specific sorting behavior

Typical usage:

```tsx
<AppDataTable
  title="Faculty List"
  items={items}
  rowKey="id"
  columns={columns}
  searchValue={searchInput}
  onSearchChange={setSearchInput}
  filterSlot={<ActiveOnlyToggle />}
  actionSlot={<CreateButton />}
  rowActions={(row) => <RowMenu row={row} />}
  loading={isInitialLoading}
  error={listErrorMessage}
  onRetry={() => void refetch()}
  sort={{
    key: sortKey,
    direction: sortDirection,
    onSort: handleSort,
  }}
  pagination={{
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    pageSizeOptions: [10, 20, 50],
    onPageChange: setPageNumber,
    onPageSizeChange: handlePageSizeChange,
    isFetching,
  }}
/>
```

For a new list screen, define feature-specific columns and row actions, then pass the server-state props into `AppDataTable`. Do not move filtering, paging, or mutation logic into the shared component.
## Reusable Server-Driven List Table

### Summary
Extract the current Faculty list UI into a shared, reusable table component that works for all server-paginated list pages without owning data fetching. The reusable component will handle the repeated UI shell: card layout, search box, filter/action slots, loading, error, empty state, result summary, and pagination. Feature pages like Faculty will keep query state, API calls, dialogs, and mutations.

### Key Changes
- Add a shared composite component, for example `src/components/common/AppDataTable.tsx`, built only from existing shadcn pieces (`card`, `input`, `button`, `table`, `pagination`, `spinner`).
- Define a typed reusable contract:
  - `DataTableColumn<T>` with `key`, `header`, optional `sortable`, and `render(row)`.
  - `DataTablePagination` with `pageNumber`, `pageSize`, `totalCount`, `totalPages`, `pageSizeOptions`, `onPageChange`, `onPageSizeChange`, `isFetching`.
  - `AppDataTableProps<T>` with `items`, `rowKey`, `columns`, controlled `searchValue/onSearchChange`, optional `filterSlot`, optional `actionSlot`, optional `rowActions`, `loading`, `error`, `onRetry`, `emptyMessage`, and optional controlled `sort`.
- Keep the shared table purely presentational for server-side flows:
  - no local slicing
  - no local filtering
  - no local pagination
  - no local sorting logic
  - parent pages remain responsible for API params and debounced query state
- Refactor Faculty to use the shared component:
  - `FaculityPage.tsx` keeps `pageNumber`, `pageSize`, `searchKeyword`, `isActive`, dialogs, and mutations
  - `FaculityTable.tsx` becomes a thin adapter or is removed entirely if columns/actions are passed directly from `FaculityPage`
  - current inline error banner, search UI, page-size selector, and pagination summary move into the shared component
- Add a short implementation note in `docs/reusable-table.md` describing:
  - when to use `AppDataTable`
  - what state must stay in feature pages
  - how to define columns/actions for new list screens

### Important Interface Changes
- New shared generics:
  - `DataTableColumn<T>`
  - `DataTablePagination`
  - `AppDataTableProps<T>`
- No API changes to `faculityApi.getList()` or `getPageQuery()`.
- Faculty page remains server-driven and still uses current query hooks and toast/error behavior.

### Test Plan
- Faculty page still sends server-side pagination/search params exactly as before.
- Shared table renders correctly for:
  - loading state
  - inline error state with retry
  - empty list state
  - populated rows
- Pagination buttons and page-size select call parent callbacks correctly.
- Search input stays controlled and does not perform its own fetch logic.
- Sort header clicks call parent sort callback but do not reorder rows inside the shared component.
- Existing Faculty create/update/delete dialogs and toast behavior remain unchanged after migration.

### Assumptions
- The reusable table is for server-paginated admin/list pages, not spreadsheet-like grids.
- Row selection, bulk actions, column resizing, and column visibility are out of scope for v1.
- We will keep using shadcn registry primitives already in the repo rather than introducing TanStack Table.

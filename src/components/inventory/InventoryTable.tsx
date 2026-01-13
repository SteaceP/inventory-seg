import React, { useMemo, useState, useEffect, useRef } from "react";
import { Paper, IconButton, Box } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import type {
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid";
import type { InventoryItem } from "../../types/inventory";
import { useThemeContext } from "../../contexts/useThemeContext";
import { useTranslation } from "../../i18n";
import { useAlert } from "../../contexts/useAlertContext";

interface InventoryTableProps {
  items: InventoryItem[];
  selectedItems: Set<string>;
  onToggleAll: (checked: boolean) => void;
  onToggleItem: (id: string, checked: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  // Optional server-side fetch callback. If provided, the grid will use server pagination.
  fetchServerRows?: (opts: {
    page: number;
    pageSize: number;
    search?: string;
    sortField?: string;
    sortDir?: "asc" | "desc";
  }) => Promise<{ rows: InventoryItem[]; total: number }>;
  searchQuery?: string;
  isDesktop?: boolean;
  isLowStockFilter?: boolean;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  selectedItems,
  onToggleAll,
  onToggleItem,
  onEdit,
  onDelete,
  fetchServerRows,
  searchQuery,
  isDesktop,
  isLowStockFilter,
}) => {
  const { compactView } = useThemeContext();
  const { t } = useTranslation();
  const { showError } = useAlert(); // Initialize useAlert

  const rows = useMemo(() => items.map((it) => ({ ...it })), [items]);

  const columns: GridColDef[] = [
    {
      field: "image_url",
      headerName: t("table.image"),
      sortable: false,
      filterable: false,
      width: compactView ? 80 : 100,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Box
            component="img"
            src={params.value}
            sx={{
              width: compactView ? 36 : 48,
              height: compactView ? 36 : 48,
              objectFit: "cover",
              borderRadius: 1,
            }}
          />
        ) : (
          <Box
            sx={{
              width: compactView ? 36 : 48,
              height: compactView ? 36 : 48,
              bgcolor: "action.hover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
            }}
          >
            <ImageIcon sx={{ color: "text.secondary" }} />
          </Box>
        ),
    },
    { field: "name", headerName: t("table.name"), flex: 1, minWidth: 150 },
    { field: "category", headerName: t("table.category"), width: 140 },
    {
      field: "stock",
      headerName: t("table.stock"),
      width: 120,
      type: "number",
    },
    {
      field: "actions",
      headerName: t("table.actions"),
      sortable: false,
      filterable: false,
      width: 140,
      align: "right",
      renderCell: (params: GridRenderCellParams) => {
        const id = params.id as string;
        const item = items.find((i) => i.id === id)!;
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => onEdit(item)}
              sx={{ color: "primary.main" }}
              title={t("inventory.edit")}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            {onDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(id)}
                sx={{ color: "error.main" }}
                title={t("inventory.delete")}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        );
      },
    },
  ];

  const rowSelectionModel = useMemo(
    () => ({
      ids: new Set(Array.from(selectedItems)),
      type: "include" as const,
    }),
    [selectedItems]
  );

  // Server-side pagination state
  const [serverRows, setServerRows] = useState<InventoryItem[]>([]);
  const [rowCountState, setRowCountState] = useState<number>(rows.length);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const serverSide = typeof fetchServerRows === "function";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!serverSide || loading) return;

      if (!navigator.onLine) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const sortItem =
          sortModel && sortModel.length > 0 ? sortModel[0] : undefined;
        const res = await fetchServerRows({
          page: paginationModel.page,
          pageSize: paginationModel.pageSize,
          search: searchQuery,
          sortField: sortItem?.field,
          sortDir: (sortItem?.sort as "asc" | "desc") ?? undefined,
        });
        if (!mounted) return;
        setServerRows(res.rows);
        setRowCountState(res.total);
      } catch (err: unknown) {
        if (navigator.onLine) {
          showError(
            t("table.failedToLoadRows") + ": " + (err as Error).message
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchServerRows,
    paginationModel.page,
    paginationModel.pageSize,
    serverSide,
    sortModel,
    searchQuery,
    showError,
    isLowStockFilter,
  ]);

  // Compute a pageSize based on container height for desktop to mimic autoPageSize
  useEffect(() => {
    if (!isDesktop) return;
    const el = containerRef.current;
    if (!el) return;

    const computeAndSet = () => {
      const height = el.clientHeight;
      // approximate header (column headers + toolbar) and footer (pagination) heights
      const toolbarHeight = 56; // approximate toolbar/header
      const footerHeight = 56; // approximate pagination/footer
      const headerRowHeight = 56; // column header
      const available = Math.max(
        200,
        height - toolbarHeight - footerHeight - headerRowHeight
      );
      const rowHeight = compactView ? 36 : 52;
      const newPageSize = Math.max(1, Math.floor(available / rowHeight));
      setPaginationModel((p) =>
        p.pageSize === newPageSize ? p : { ...p, pageSize: newPageSize }
      );
    };

    computeAndSet();
    const ro = new ResizeObserver(() => computeAndSet());
    ro.observe(el);
    window.addEventListener("resize", computeAndSet);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", computeAndSet);
    };
  }, [isDesktop, compactView]);

  const handleSelectionChange = (newSelection: Array<string | number>) => {
    const newSet = new Set(newSelection.map(String));
    // items added
    for (const id of newSet) {
      if (!selectedItems.has(id)) onToggleItem(id, true);
    }
    // items removed
    for (const id of selectedItems) {
      if (!newSet.has(id)) onToggleItem(id, false);
    }
    // if user toggled all
    if (newSet.size === items.length && items.length > 0) onToggleAll(true);
    if (newSet.size === 0) onToggleAll(false);
  };

  // No custom quick filter — rely on DataGrid's built-in toolbar quick filter when `showToolbar` is enabled

  return (
    <Paper
      sx={{
        width: "100%",
        borderRadius: compactView ? 1 : 2,
        overflow: "hidden",
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: isDesktop
            ? compactView
              ? 720
              : 820
            : compactView
              ? 420
              : 520,
          width: "100%",
        }}
      >
        <DataGrid
          rows={serverSide ? serverRows : rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(model: unknown) => {
            let ids: Array<string | number> = [];
            if (Array.isArray(model)) {
              ids = model as Array<string | number>;
            } else if (model && typeof model === "object" && "ids" in model) {
              const m = model as {
                ids: Set<string | number> | Array<string | number>;
              };
              if (m.ids instanceof Set) ids = Array.from(m.ids);
              else ids = m.ids as Array<string | number>;
            }
            handleSelectionChange(ids);
          }}
          showToolbar
          sortingMode={serverSide ? "server" : "client"}
          sortModel={sortModel}
          onSortModelChange={(model: GridSortModel) => {
            setSortModel(model || []);
            // reset to page 0 when sort changes
            setPaginationModel((p) => ({ ...p, page: 0 }));
          }}
          pageSizeOptions={[10, 25, 50]}
          paginationMode={serverSide ? "server" : "client"}
          rowCount={serverSide ? rowCountState : rows.length}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel(model)}
          density={compactView ? "compact" : "standard"}
          loading={loading}
          sx={{ border: "none", "& .MuiDataGrid-cell": { outline: "none" } }}
        />
      </div>
    </Paper>
  );
};

export default InventoryTable;

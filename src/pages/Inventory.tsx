import React from "react";
import { Box, CircularProgress, useTheme, useMediaQuery } from "@mui/material";
import { useThemeContext } from "../contexts/ThemeContext";
import { useTranslation } from "../i18n";
import BarcodePrinter from "../components/BarcodePrinter";
import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryCategorizedGrid from "../components/inventory/InventoryCategorizedGrid";
import InventoryDialog from "../components/inventory/InventoryDialog";
import InventoryScanner from "../components/inventory/InventoryScanner";
import StockAdjustmentDialog from "../components/inventory/StockAdjustmentDialog";
import StockHistoryDialog from "../components/inventory/StockHistoryDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import CategoryManagementDialog from "../components/inventory/CategoryManagementDialog";
import InventoryDrawer from "../components/inventory/InventoryDrawer";
import InventoryStats from "../components/inventory/InventoryStats";
import CategoryFilters from "../components/inventory/CategoryFilters";
import { useInventoryPage } from "../hooks/useInventoryPage";

const Inventory: React.FC = () => {
  const {
    items,
    inventoryLoading,
    actionLoading,
    open,
    stockDialogOpen,
    categoriesDialogOpen,
    scanOpen,
    editingItem,
    formData,
    selectedItems,
    searchQuery,
    isLowStockFilter,
    deleteConfirmOpen,
    historyDialogOpen,
    selectedItemForHistory,
    openDrawer,
    selectedItem,
    currentTab,
    selectedCategory,
    filteredItems,
    role,
    globalThreshold,
    categories,
    setSearchQuery,
    setStockDialogOpen,
    setCategoriesDialogOpen,
    setScanOpen,
    setFormData,
    setDeleteConfirmOpen,
    setHistoryDialogOpen,
    setSelectedItemForHistory,
    setOpenDrawer,
    setCurrentTab,
    setSelectedCategory,
    toggleLowStockFilter,
    handleOpen,
    handleAdjust,
    handleEdit,
    handleClose,
    getBarcodeFormat,
    handleImageUpload,
    handleStockSave,
    handleSave,
    handleDeleteClick,
    handleDeleteConfirm,
    generateSKU,
    handleScanSuccess,
    toggleItem,
    setSearchParams,
    searchParams,
  } = useInventoryPage();

  const { compactView } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        p: compactView ? 2 : 3,
        maxWidth: { lg: "2200px", xl: "3200px" },
        mx: "auto",
      }}
    >
      <InventoryHeader
        isMobile={isMobile}
        selectedCount={selectedItems.size}
        onPrint={() => window.print()}
        onScan={() => setScanOpen(true)}
        onAdd={role === "admin" ? () => handleOpen() : undefined}
        isLowStockFilter={isLowStockFilter}
        onToggleLowStock={toggleLowStockFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onManageCategories={
          role === "admin" ? () => setCategoriesDialogOpen(true) : undefined
        }
      />

      {inventoryLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <InventoryStats
            items={items}
            globalThreshold={globalThreshold}
            categories={categories}
            activeTab={currentTab}
            onTabChange={(newValue: number) => {
              setCurrentTab(newValue);
              if (newValue === 1) {
                setSearchParams({ filter: "lowStock" });
              } else if (newValue === 2) {
                setSearchParams({ filter: "outOfStock" });
              } else {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("filter");
                setSearchParams(newParams);
              }
            }}
          />

          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <InventoryCategorizedGrid
            items={filteredItems}
            selectedItems={selectedItems}
            onToggleItem={toggleItem}
            onEdit={handleOpen}
            onAdjust={handleAdjust}
            onDelete={
              role === "admin" ? (id) => handleDeleteClick(id) : undefined
            }
            onViewHistory={(itemId, itemName) => {
              setSelectedItemForHistory({ id: itemId, name: itemName });
              setHistoryDialogOpen(true);
            }}
            compactView={compactView}
            selectedCategory={selectedCategory}
          />
        </>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t("inventory.delete") || "Delete Item"}
        content={t("inventory.deleteConfirm")}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <InventoryDialog
        open={open}
        editingItem={editingItem}
        formData={formData}
        isMobile={isMobile}
        onClose={handleClose}
        onSave={() => void handleSave()}
        onFormDataChange={setFormData}
        onGenerateSKU={generateSKU}
        onImageUpload={(file) => void handleImageUpload(file)}
        getBarcodeFormat={getBarcodeFormat}
        role={role}
        loading={actionLoading}
      />

      <StockAdjustmentDialog
        open={stockDialogOpen}
        item={selectedItem}
        isMobile={isMobile}
        onClose={() => setStockDialogOpen(false)}
        onSave={(
          itemId,
          newStock,
          location,
          actionType,
          parentLocation,
          recipient,
          destination
        ) =>
          void handleStockSave(
            itemId,
            newStock,
            location,
            actionType,
            parentLocation,
            recipient,
            destination
          )
        }
        loading={actionLoading}
      />

      <InventoryScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanSuccess={handleScanSuccess}
        onError={(msg) => showError(msg)}
      />

      <BarcodePrinter
        items={items
          .filter((i) => selectedItems.has(i.id))
          .map((i) => ({
            name: i.name,
            sku: i.sku || "",
            category: i.category,
          }))}
      />

      <CategoryManagementDialog
        open={categoriesDialogOpen}
        onClose={() => setCategoriesDialogOpen(false)}
      />

      <StockHistoryDialog
        open={historyDialogOpen}
        itemId={selectedItemForHistory?.id || null}
        itemName={selectedItemForHistory?.name || ""}
        onClose={() => {
          setHistoryDialogOpen(false);
          setSelectedItemForHistory(null);
        }}
      />

      <InventoryDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        item={selectedItem}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onAdjustStock={handleAdjust}
        globalThreshold={globalThreshold}
        categories={categories}
      />
    </Box>
  );
};

export default Inventory;

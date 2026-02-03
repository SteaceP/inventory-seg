import React from "react";
import ReactDOM from "react-dom";
import LazyBarcode from "./inventory/shared/LazyBarcode";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PrintItem {
  name: string;
  sku: string;
  category: string;
}

interface BarcodePrinterProps {
  items: PrintItem[];
}

const BarcodePrinter: React.FC<BarcodePrinterProps> = ({ items }) => {
  if (items.length === 0) return null;

  const getBarcodeFormat = (sku: string) => {
    const cleanSku = (sku || "").trim();
    if (/^\d{12}$/.test(cleanSku)) return "UPC";
    if (/^\d{13}$/.test(cleanSku)) return "EAN13";
    if (/^\d{8}$/.test(cleanSku)) return "EAN8";
    return "CODE128";
  };

  return ReactDOM.createPortal(
    <Box
      className="print-only-area"
      sx={{
        width: "8.5in",
        height: "11in",
        padding: "0.5in 0.156in",
        backgroundColor: "white",
        color: "black",
        "& *": {
          color: "black !important",
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "4in 4in",
          gridTemplateRows: "repeat(5, 2in)",
          columnGap: "0.125in",
          rowGap: "0in",
          width: "100%",
          height: "10in",
        }}
      >
        {items.map((item, index) => (
          <Box
            // eslint-disable-next-line react-x/no-array-index-key
            key={index}
            sx={{
              width: "4in",
              height: "2in",
              padding: "0.2in",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed #eee",
              boxSizing: "border-box",
              overflow: "hidden",
              pageBreakInside: "avoid",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "bold",
                mb: 0.5,
                textAlign: "center",
                fontSize: "10pt",
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mb: 1,
                color: "gray",
                fontSize: "8pt",
              }}
            >
              {item.category}
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "center", width: "100%" }}
            >
              <LazyBarcode
                value={item.sku || "N/A"}
                format={getBarcodeFormat(item.sku)}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>,
    document.body
  );
};

export default BarcodePrinter;

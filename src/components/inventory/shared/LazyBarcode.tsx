import React, { Suspense, lazy } from "react";
import type { BarcodeProps } from "react-barcode";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

// Lazy load the barcode library (75 kB) only when needed
const BarcodeComponent = lazy(() => import("react-barcode"));

interface LazyBarcodeProps {
  value: string;
  format: BarcodeProps["format"];
}

const LazyBarcode: React.FC<LazyBarcodeProps> = ({ value, format }) => {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" width={200} height={70} />
        </Box>
      }
    >
      <BarcodeComponent
        value={value}
        format={format}
        width={2.0}
        height={50}
        fontSize={14}
        background="#ffffff"
        margin={10}
      />
    </Suspense>
  );
};

export default LazyBarcode;

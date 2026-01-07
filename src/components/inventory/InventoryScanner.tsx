import React, { useEffect, useRef } from "react";
import { Dialog, Box, IconButton, Typography, Button } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import { useTranslation } from "../../i18n";

interface InventoryScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  onError: (message: string) => void;
}

const InventoryScanner: React.FC<InventoryScannerProps> = ({
  open,
  onClose,
  onScanSuccess,
  onError,
}) => {
  const { t } = useTranslation();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    if (open && !scannerRef.current) {
      const timeoutId = setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          const config = {
            fps: 20,
            qrbox: { width: 300, height: 150 },
            aspectRatio: 1.0,
          };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              html5QrCode
                .stop()
                .then(() => {
                  scannerRef.current = null;
                  onScanSuccessRef.current(decodedText);
                })
                .catch(() => {
                  scannerRef.current = null;
                  onScanSuccessRef.current(decodedText);
                });
            },
            () => {}
          );
        } catch {
          onError(
            "Impossible de démarrer la caméra. Veuillez vérifier les permissions."
          );
          onClose();
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }

    if (!open && scannerRef.current) {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    }
  }, [open, onClose, onError]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableEnforceFocus
      disableRestoreFocus
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          color: "text.primary",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "20px",
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: "center", position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
          {t("inventory.scanner.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("inventory.scanner.instructions")}
        </Typography>

        <Box
          sx={{
            position: "relative",
            width: "300px",
            height: "300px",
            margin: "0 auto",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 20px rgba(0,0,0,0.5)"
                : "0 4px 20px rgba(0,0,0,0.1)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box id="reader" sx={{ width: "100%", height: "100%" }} />

          {/* Custom Scanner Overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Corner Accents */}
            <Box
              sx={{
                position: "absolute",
                top: 20,
                left: 20,
                width: 30,
                height: 30,
                borderLeft: "4px solid",
                borderColor: "primary.main",
                borderTop: "4px solid",
                borderRadius: "4px 0 0 0",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 30,
                height: 30,
                borderRight: "4px solid",
                borderColor: "primary.main",
                borderTop: "4px solid",
                borderRadius: "0 4px 0 0",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 20,
                left: 20,
                width: 30,
                height: 30,
                borderLeft: "4px solid",
                borderColor: "primary.main",
                borderBottom: "4px solid",
                borderRadius: "0 0 0 4px",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 20,
                right: 20,
                width: 30,
                height: 30,
                borderRight: "4px solid",
                borderColor: "primary.main",
                borderBottom: "4px solid",
                borderRadius: "0 0 4px 0",
              }}
            />

            {/* Pulsing Scan Line */}
            <motion.div
              initial={{ top: "15%" }}
              animate={{ top: "85%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
              style={{
                position: "absolute",
                left: "10%",
                right: "10%",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, #027d6f, transparent)",
                boxShadow: "0 0 15px #027d6f",
                zIndex: 10,
              }}
            />

            {/* Semi-transparent Backdrop Mask */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: "40px solid rgba(13, 17, 23, 0.4)",
              }}
            />
          </Box>
        </Box>

        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            mt: 4,
            color: "text.secondary",
            borderColor: "divider",
            borderRadius: "10px",
            px: 4,
          }}
        >
          {t("inventory.cancel")}
        </Button>
      </Box>
    </Dialog>
  );
};

export default InventoryScanner;

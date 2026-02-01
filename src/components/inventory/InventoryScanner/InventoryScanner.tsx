import React, { useEffect, useRef } from "react";
import { Dialog, Box, IconButton, Typography, Button } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";

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
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    if (!open) {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      return;
    }

    if (codeReaderRef.current) return;

    const initScanner = async () => {
      try {
        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          throw new Error("No camera found");
        }

        // Prefer environment (back) camera
        const selectedDevice =
          videoInputDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || videoInputDevices[0];

        await codeReader.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              codeReader.reset();
              codeReaderRef.current = null;
              onScanSuccessRef.current(result.getText());
            }
            if (err && !(err instanceof NotFoundException)) {
              // Only report serious errors, not "not found" which triggers every frame
              console.error(err);
            }
          }
        );
      } catch (err) {
        console.error("Scanner Error:", err);
        onError(t("inventory.scanner.cameraError"));
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      void initScanner();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, [open, onClose, onError, t]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableEnforceFocus
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "20px",
            overflow: "hidden",
          },
        },
      }}
    >
      <Box
        sx={{ p: { xs: 2, sm: 3 }, textAlign: "center", position: "relative" }}
      >
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
            width: "100%",
            maxWidth: "320px",
            aspectRatio: "16/9",
            height: "auto",
            margin: "0 auto",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 20px rgba(0,0,0,0.5)"
                : "0 4px 20px rgba(0,0,0,0.1)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            component="video"
            ref={videoRef}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

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
                top: "28%",
                left: "8%",
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
                top: "28%",
                right: "8%",
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
                bottom: "28%",
                left: "8%",
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
                bottom: "28%",
                right: "8%",
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
              initial={{ top: "30%" }}
              animate={{ top: "70%" }}
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

import React, { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";
import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";

import { useTranslation } from "@/i18n";

import { reportError } from "@utils/errorReporting";

import type { BrowserMultiFormatReader } from "@zxing/library";

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
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    if (!open) {
      setDevices([]);
      setCurrentDeviceIndex(null);
      return;
    }

    const discoverDevices = async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/library");
        const reader = new BrowserMultiFormatReader();
        const videoInputDevices = await reader.listVideoInputDevices();
        setDevices(videoInputDevices);

        if (videoInputDevices.length > 0) {
          const backCameraIndex = videoInputDevices.findIndex((device) =>
            device.label.toLowerCase().includes("back")
          );
          setCurrentDeviceIndex(backCameraIndex !== -1 ? backCameraIndex : 0);
        }
      } catch (err) {
        reportError(err, { context: "Scanner Discovery Error" });
      }
    };

    void discoverDevices();
  }, [open]);

  useEffect(() => {
    if (!open || currentDeviceIndex === null || devices.length === 0) {
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setIsLoading(true);

        const { BrowserMultiFormatReader, NotFoundException } =
          await import("@zxing/library");

        if (codeReaderRef.current) {
          codeReaderRef.current.reset();
        }

        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        const selectedDevice = devices[currentDeviceIndex];

        if (!isMounted) return;

        setIsLoading(false);

        await codeReader.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current,
          (result, err) => {
            if (result && isMounted) {
              codeReader.reset();
              codeReaderRef.current = null;
              onScanSuccessRef.current(result.getText());
            }
            if (err && !(err instanceof NotFoundException)) {
              reportError(err);
            }
          }
        );

        // Re-discover devices after starting to get labels and full list if permissions were just granted
        if (isMounted) {
          try {
            const updatedDevices = await codeReader.listVideoInputDevices();
            if (updatedDevices.length !== devices.length) {
              setDevices(updatedDevices);
            }
          } catch (err) {
            reportError(err, { context: "Scanner Post-Start Discovery Error" });
          }
        }
      } catch (err) {
        if (isMounted) {
          reportError(err, { context: "Scanner Start Error" });
          setIsLoading(false);
          onError(t("inventory.scanner.cameraError"));
          onClose();
        }
      }
    };

    const timeoutId = setTimeout(() => {
      void startScanner();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, [open, currentDeviceIndex, devices, onError, onClose, t]);

  const handleSwitchCamera = () => {
    if (devices.length <= 1) return;
    setCurrentDeviceIndex((prev) =>
      prev !== null ? (prev + 1) % devices.length : 0
    );
  };

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

          {/* Camera switch button */}
          {devices.length > 1 && (
            <IconButton
              onClick={handleSwitchCamera}
              disabled={isLoading}
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
                zIndex: 30,
              }}
              title={t("inventory.scanner.switchCamera")}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <FlipCameraIosIcon fontSize="small" />
              )}
            </IconButton>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.7)",
                zIndex: 20,
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}

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

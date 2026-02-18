import React, { useRef, useEffect } from "react";

import { motion } from "framer-motion";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTranslation } from "@/i18n";

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void;
  onVoiceSend: (blob: Blob) => void;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onVoiceSend,
  loading,
}) => {
  const { t } = useTranslation();
  const { isRecording, startRecording, stopRecording, audioBlob } =
    useAudioRecorder();

  // Effect to send audio when blob is ready (and we just finished recording)
  // We need a ref to track if we *should* send, to avoid sending on initial mount or updates
  const shouldSendRef = useRef(false);

  useEffect(() => {
    if (audioBlob && shouldSendRef.current) {
      onVoiceSend(audioBlob);
      shouldSendRef.current = false;
    }
  }, [audioBlob, onVoiceSend]);

  const toggleListening = async () => {
    if (isRecording) {
      stopRecording();
      shouldSendRef.current = true;
    } else {
      await startRecording();
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        pb: { xs: 4, sm: 2 }, // Extra padding for mobile home bar
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={
            isRecording
              ? t("assistant.listening") || "Listening..."
              : t("assistant.placeholder")
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          slotProps={{
            htmlInput: {
              autoComplete: "off",
              name: "emmanuel-chat-input",
              id: "emmanuel-chat-input",
            },
            input: {
              endAdornment: (
                <Tooltip title={isRecording ? "Stop listening" : "Voice input"}>
                  <IconButton
                    onClick={() => void toggleListening()}
                    color={isRecording ? "error" : "default"}
                    size="small"
                    sx={{
                      mr: 1,
                      animation: isRecording ? "pulse 1.5s infinite" : "none",
                      "@keyframes pulse": {
                        "0%": { boxShadow: "0 0 0 0 rgba(211, 47, 47, 0.4)" },
                        "70%": { boxShadow: "0 0 0 10px rgba(211, 47, 47, 0)" },
                        "100%": { boxShadow: "0 0 0 0 rgba(211, 47, 47, 0)" },
                      },
                    }}
                  >
                    {isRecording ? <StopIcon /> : <MicIcon />}
                  </IconButton>
                </Tooltip>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 4,
              pr: 1, // Adjust padding for inner button
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={onSend}
          disabled={!input.trim() || loading}
          sx={{
            alignSelf: "center",
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
            width: 48,
            height: 48,
          }}
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInput;

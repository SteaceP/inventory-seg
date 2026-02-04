import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { useErrorHandler } from "@hooks/useErrorHandler";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

import type {
  ChatInputProps,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognition,
  SpeechRecognitionConstructor,
} from "@/types/assistant";

// Helper for browser support
const SpeechRecognition =
  (window as unknown as { SpeechRecognition: SpeechRecognitionConstructor })
    .SpeechRecognition ||
  (
    window as unknown as {
      webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
  ).webkitSpeechRecognition;

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  loading,
}) => {
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one sentence/pause
      recognition.interimResults = true;
      recognition.lang = document.documentElement.lang || "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        // Basic appending logic (could be improved to not overwrite)
        if (event.results[0].isFinal) {
          setInput((prev: string) => {
            const spacer = prev && !prev.endsWith(" ") ? " " : "";
            return prev + spacer + transcript;
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);

        // Ignore aborted error as it happens when stopping manually
        if (event.error === "aborted") return;

        let messageKey = "assistant.errors.generic";

        switch (event.error) {
          case "no-speech":
            messageKey = "assistant.errors.no_speech";
            break;
          case "audio-capture":
            messageKey = "assistant.errors.audio_capture";
            break;
          case "not-allowed":
          case "service-not-allowed":
            messageKey = "assistant.errors.permission_denied";
            break;
          case "network":
            messageKey = "assistant.errors.network";
            break;
        }

        handleError(
          new Error(`SpeechRecognition error: ${event.error}`),
          t(messageKey)
        );
      };

      recognitionRef.current = recognition;
    }
  }, [setInput, handleError, t]);

  const toggleListening = () => {
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Re-initialize language in case user changed it
      if (recognitionRef.current) {
        recognitionRef.current.lang = document.documentElement.lang || "en-US";
      }
      recognitionRef.current?.start();
      setIsListening(true);
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
            isListening ? "Listening..." : t("assistant.placeholder")
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
                <Tooltip title={isListening ? "Stop listening" : "Voice input"}>
                  <IconButton
                    onClick={toggleListening}
                    color={isListening ? "error" : "default"}
                    size="small"
                    sx={{
                      mr: 1,
                      animation: isListening ? "pulse 1.5s infinite" : "none",
                      "@keyframes pulse": {
                        "0%": { boxShadow: "0 0 0 0 rgba(211, 47, 47, 0.4)" },
                        "70%": { boxShadow: "0 0 0 10px rgba(211, 47, 47, 0)" },
                        "100%": { boxShadow: "0 0 0 0 rgba(211, 47, 47, 0)" },
                      },
                    }}
                  >
                    {isListening ? <StopIcon /> : <MicIcon />}
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

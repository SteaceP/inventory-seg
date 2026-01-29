import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  SmartToy as RobotIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";
import { AnimatePresence } from "framer-motion";
import { useUserContext } from "@contexts/UserContext";
import { useTranslation } from "@/i18n";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { usePerformance } from "@hooks/usePerformance";

// Sub-components
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import WelcomeView from "./WelcomeView";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem("emmanuel-chat-history");
      return saved ? (JSON.parse(saved) as Message[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const { measureOperation } = usePerformance();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const { avatarUrl } = useUserContext();
  const { t, lang } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("emmanuel-chat-history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("emmanuel-chat-history");
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      await measureOperation(
        "assistant.chat",
        "Send Message to Assistant",
        async () => {
          const response = await fetch("/api/assistant/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: newMessages,
              language: lang,
            }),
          });

          if (!response.ok) {
            const errorData = (await response.json().catch(() => ({}))) as {
              details?: string;
            };
            throw new Error(errorData.details || "Failed to get response");
          }

          const data = (await response.json()) as {
            response?: string;
            content?: string;
          };
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              data.response || data.content || t("assistant.processError"),
          };

          setMessages((prev) => [...prev, assistantMessage]);
        }
      );
    } catch (error) {
      handleError(error);

      const errorMessage =
        error instanceof Error ? error.message : t("assistant.error");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          p: 2,
          pr: 10, // Make room for both buttons
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          {t("assistant.title")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t("assistant.description")}
        </Typography>
      </Box>

      {/* Clear Chat Button - Positioned next to Close Button */}
      <Tooltip title={t("common.clear") || "Clear Chat"}>
        <IconButton
          onClick={handleClearChat}
          size="medium" // Match default IconButton size
          sx={{
            position: "absolute",
            top: 12,
            right: 56, // 12px (close button right) + 40px (button width) + 4px (gap)
            zIndex: 1,
            color: "text.secondary",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
            "&:hover": {
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              color: "error.main",
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Box
        ref={scrollRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.length === 0 && <WelcomeView />}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} avatarUrl={avatarUrl} />
          ))}
        </AnimatePresence>

        {loading && (
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "secondary.main",
              }}
            >
              <RobotIcon />
            </Avatar>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                borderBottomLeftRadius: 0,
                bgcolor: "background.paper",
              }}
            >
              <CircularProgress size={20} color="secondary" />
            </Paper>
          </Box>
        )}
      </Box>

      <ChatInput
        input={input}
        setInput={setInput}
        onSend={() => void handleSend()}
        loading={loading}
      />
    </Box>
  );
};

export default ChatInterface;

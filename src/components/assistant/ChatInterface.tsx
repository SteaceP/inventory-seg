import React, { useState, useRef, useEffect } from "react";

import { AnimatePresence } from "framer-motion";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import RobotIcon from "@mui/icons-material/SmartToy";

import { useTranslation } from "@/i18n";
import type { Message } from "@/types/assistant";

import { useUserContext } from "@contexts/UserContextDefinition";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { usePerformance } from "@hooks/usePerformance";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import WelcomeView from "./WelcomeView";
import { AudioPlayer } from "../AudioPlayer";

interface ChatInterfaceProps {
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem("emmanuel-chat-history");
      return saved ? (JSON.parse(saved) as Message[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [audioResponse, setAudioResponse] = useState<string | null>(null);
  const { measureOperation } = usePerformance();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const { avatarUrl, session } = useUserContext();
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
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
          }

          const response = await fetch("/api/assistant/chat", {
            method: "POST",
            headers,
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

  const handleVoiceSend = async (audioBlob: Blob) => {
    if (loading) return;

    setLoading(true);
    setAudioResponse(null); // Clear previous audio response

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: t("assistant.voiceInput"), // Placeholder for voice input
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      await measureOperation(
        "assistant.voiceChat",
        "Send Voice Message to Assistant",
        async () => {
          const formData = new FormData();
          formData.append("audio", audioBlob, "audio.webm");
          formData.append("language", lang);
          formData.append("messages", JSON.stringify(newMessages));

          const headers: Record<string, string> = {};
          if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
          }

          const response = await fetch("/api/assistant/voice-chat", {
            method: "POST",
            headers,
            body: formData,
          });

          if (!response.ok) {
            const errorData = (await response.json().catch(() => ({}))) as {
              details?: string;
            };
            throw new Error(
              errorData.details || "Failed to get voice response"
            );
          }

          const data = (await response.json()) as {
            response?: string;
            content?: string;
            audioUrl?: string;
          };

          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              data.response || data.content || t("assistant.processError"),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          if (data.audioUrl) {
            setAudioResponse(data.audioUrl);
          }
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
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="primary"
            noWrap
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            {t("assistant.title")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            display="block"
          >
            {t("assistant.description")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
          {/* Clear Chat Button */}
          <Tooltip title={t("common.clear") || "Clear Chat"}>
            <IconButton
              onClick={handleClearChat}
              size="small"
              sx={{
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

          {/* Close Button */}
          {onClose && (
            <Tooltip title={t("common.close") || "Close"}>
              <IconButton
                onClick={onClose}
                size="small"
                sx={{
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
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

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
        onVoiceSend={(blob) => void handleVoiceSend(blob)}
        loading={loading}
      />
      <AudioPlayer src={audioResponse} autoPlay={true} />
    </Box>
  );
};

export default ChatInterface;

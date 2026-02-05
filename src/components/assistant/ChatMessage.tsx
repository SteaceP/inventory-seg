import React from "react";

import { motion } from "framer-motion";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import PersonIcon from "@mui/icons-material/Person";
import RobotIcon from "@mui/icons-material/SmartToy";

import type { ChatMessageProps } from "@/types/assistant";

const ChatMessage: React.FC<ChatMessageProps> = ({ message, avatarUrl }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        alignSelf: message.role === "user" ? "flex-end" : "flex-start",
        maxWidth: "80%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: message.role === "user" ? "row-reverse" : "row",
          gap: 1.5,
          alignItems: "flex-end",
        }}
      >
        <Avatar
          src={message.role === "user" ? (avatarUrl ?? undefined) : undefined}
          sx={{
            width: 32,
            height: 32,
            bgcolor:
              message.role === "user" ? "primary.main" : "secondary.main",
          }}
        >
          {message.role === "user" ? <PersonIcon /> : <RobotIcon />}
        </Avatar>
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            borderBottomRightRadius: message.role === "user" ? 0 : 3,
            borderBottomLeftRadius: message.role === "assistant" ? 0 : 3,
            bgcolor:
              message.role === "user" ? "primary.main" : "background.paper",
            color:
              message.role === "user" ? "primary.contrastText" : "text.primary",
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {message.content}
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default ChatMessage;

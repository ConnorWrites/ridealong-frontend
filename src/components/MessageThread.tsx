import { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { listMessages, sendMessage } from "../api/messages";
import { useAuth } from "../context/AuthContext";
import type { Message } from "../types";

interface MessageThreadProps {
  requestId: string;
  otherPartyName: string;
}

export default function MessageThread({ requestId, otherPartyName }: MessageThreadProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listMessages(requestId)
      .then((data) => { if (!cancelled) setMessages(data); })
      .catch(() => { if (!cancelled) setError("Could not load messages"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!content.trim()) return;
    setSending(true);
    setError("");
    try {
      const message = await sendMessage(requestId, content.trim());
      setMessages((prev) => [...prev, message]);
      setContent("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, display: "flex", flexDirection: "column", height: 360 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Conversation with {otherPartyName}
      </Typography>

      <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 1, pr: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
            No messages yet. Say hello!
          </Typography>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === user?.id;
            return (
              <Box key={m.id} sx={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: isMine ? "primary.main" : "grey.200",
                    color: isMine ? "primary.contrastText" : "text.primary",
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.75,
                    maxWidth: "75%",
                  }}
                >
                  <Typography variant="body2">{m.content}</Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={bottomRef} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={sending}
        />
        <IconButton color="primary" onClick={handleSend} disabled={sending || !content.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  Stack,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import axios from "axios";

interface Notif {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

interface Props {
  eventId?: string | number;
}

export default function EventRegistrationForm({ eventId }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact_number: "",
    number_of_tickets: 1,
    comments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState<Notif>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange =
    (key: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((p) => ({
        ...p,
        [key]: key === "number_of_tickets" ? Number(e.target.value) : e.target.value,
      }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventId) {
      setNotif({
        open: true,
        message: "Event not loaded yet.",
        severity: "error",
      });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/api/event-registration", {
        event_id: eventId,
        ...form,
      });
      setNotif({
        open: true,
        message: "Registration successful! See you at the event 🎉",
        severity: "success",
      });
      setForm({
        name: "",
        email: "",
        contact_number: "",
        number_of_tickets: 1,
        comments: "",
      });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed. Please try again.";
      setNotif({ open: true, message: msg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      bgcolor: "#ffffff",
      transition: "all 0.2s ease",
      "& fieldset": { borderColor: "rgba(255,255,255,0.0)" },
      "&:hover fieldset": { borderColor: "#bfdbfe" },
      "&.Mui-focused fieldset": {
        borderColor: "#3b82f6",
        borderWidth: 2,
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 500,
      color: "#475569",
    },
    "& .MuiOutlinedInput-input": {
      py: 1.5,
    },
  } as const;

  return (
    <>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            placeholder="Full Name"
            fullWidth
            required
            value={form.name}
            onChange={handleChange("name")}
            sx={inputSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            placeholder="Email Address"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={handleChange("email")}
            sx={inputSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            placeholder="Contact Number"
            fullWidth
            required
            value={form.contact_number}
            onChange={handleChange("contact_number")}
            sx={inputSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            placeholder="Number of Participants"
            type="number"
            fullWidth
            required
            value={form.number_of_tickets}
            onChange={handleChange("number_of_tickets")}
            sx={inputSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <ConfirmationNumberOutlinedIcon
                      sx={{ color: "#64748b" }}
                    />
                  </InputAdornment>
                ),
              },
              htmlInput: { min: 1 },
            }}
          />

          <TextField
            placeholder="Additional comments (optional)"
            multiline
            rows={3}
            fullWidth
            value={form.comments}
            onChange={handleChange("comments")}
            sx={inputSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                    <ChatBubbleOutlineIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                <HowToRegRoundedIcon />
              )
            }
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: 3,
              background:
                "linear-gradient(90deg, #1446A0 0%, #2B7BFF 50%, #00D4FF 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "none",
              letterSpacing: "0.02em",
              boxShadow: "0 8px 22px rgba(43,123,255,0.32)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 28px rgba(43,123,255,0.42)",
              },
              "&:disabled": {
                opacity: 0.7,
                color: "#fff",
              },
            }}
          >
            {submitting ? "Registering…" : "Reserve My Spot"}
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={notif.open}
        autoHideDuration={5000}
        onClose={() => setNotif((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotif((p) => ({ ...p, open: false }))}
          severity={notif.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {notif.message}
        </Alert>
      </Snackbar>
    </>
  );
}

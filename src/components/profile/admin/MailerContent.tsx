"use client";
import { useRef, useState, type ChangeEvent } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Stack,
  IconButton,
  Alert,
  MenuItem,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import SendIcon from "@mui/icons-material/Send";
import AxiosInstance from "@/lib/AxiosInstance";

const LETTERHEAD_SRC = "/mailer/letterhead.jpg";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 1,
    name: "Invite Organizer to Post Event",
    subject: "Partner With Bayanihan – Post Your Events With Us!",
    content: `<div style="font-family: Arial, sans-serif; font-size:20px; line-height:1.5; color:#333; margin: 0px auto 0; padding:0; max-width:1000px;"><p style="font-size:20px!impportant;">Dear Event Organizer,</p> <h2 style="color:#06266b; font-size:26px;">Promote Your Events Globally and Connect with the Filipino Community Worldwide.</h2>
    <p style="font-size:20px!important;">Greetings!</p><p style="font-size:20px!important;">Are you looking for a way to reach more people and make your events more visible to the global Filipino community? We invite you to be part of <strong>Bayanihan.com</strong>, a growing platform dedicated to showcasing Filipino events, festivals, and community gatherings around the world.</p><p style="font-size:20px!important;">Our mission is to connect Filipino communities worldwide and celebrate our culture together.</p><p style="font-size:20px!important;">Our goal is simple: to connect Filipinos everywhere and celebrate our culture together.</p><p style="font-size:20px!important; font-weight:bold;">By publishing your events on Bayanihan.com, you can:</p><ul style="margin:0 0 -15px 0; padding-left:25px; list-style:disc !important;"><li style="list-style:disc !important; margin-top:0px;">Reach Filipinos worldwide who are looking for events in their area</li><li style="list-style:disc !important;">Increase visibility for your organization and activities</li><li style="list-style:disc !important;">Promote your events for free on a growing international platform</li><li style="list-style:disc !important;">Connect with the Filipino community and expand your audience</li></ul> <p style="font-size:20px!important;">Whether you organize cultural festivals, concerts, community gatherings, fundraisers, or social events, Bayanihan.com provides a place where people can easily discover and support your events.</p><p style="font-size:20px!important; font-weight:bold;">Getting started is simple:</p><ol style="margin:0 0 -15px 0; padding-left:25px;"><li style="margin-top:0px;">Create your Organizer Account</li><li>Submit your Event Details</li><li>Share your event with the global Filipino community</li></ol><p style="margin-top:25px; font-size:20px!important;"><strong>👉 Register as an Organizer:</strong><br/><a href="https://bayanihan.com/registration" style="color:#06266b; font-weight:bold; font-size:20px!important;">https://bayanihan.com/registration</a></p>
<p style="font-size:20px!important;">Best regards,<br/><strong>Bayanihan Team</strong><br/>info@bayanihan.com</p><p style="font-size:20px!important;">On behalf of <br/><strong>Anthony Gerard O. Leuterio</strong> <br/><i>CEO & Founder, FilipinoHomes.com & Bayanihan.com</i></p></div>`,
  },
  {
    id: 2,
    name: "Restaurant Promotion Invitation",
    subject: "Grow Your Restaurant's Reach with Bayanihan.com!",
    content: `<div style="font-family: Arial, sans-serif; font-size:19px; line-height:1.5; color:#333; margin: 0px auto 0; padding:0; max-width:1000px;"><p>Hi [Restaurant Owner's Name],</p> <p>I'm [Your Name], reaching out on behalf of Bayanihan.com, a platform dedicated to connecting local businesses with the community.</p> <p>We're inviting you to join Bayanihan.com to showcase your restaurant, attract new customers, and be part of a community that celebrates local flavors and initiatives.</p> <p>Here's what you get by joining:</p><ul style="margin:0 0 -15px 0; padding-left:25px; list-style:disc !important;"><li style="list-style:disc !important; margin-top: 0px">Increased visibility: Reach more customers looking for local dining options.</li><li style="list-style:disc !important;">Community support: Connect with campaigns and events that align with your restaurant's mission.</li><li style="list-style:disc !important;">Simple setup: List your restaurant quickly and start engaging with the community.</li></ul> <p>Getting started is easy:</p><ul style="margin:0 0 -15px 0; padding-left:5px; list-style:disc !important;"><li>1. Visit <a href="https://bayanihan.com/registration">https://bayanihan.com/registration</a></li><li>2. Create your restaurant profile</li><li>3. Share your menu, promotions, or special initiatives</li></ul>
    <p>Join us in promoting local businesses and the spirit of bayanihan! If you have any questions, just reply to this email—we're happy to help.</p> <p>Looking forward to welcoming your restaurant to Bayanihan.com!</p> <p>Best regards,<br/><strong>Bayanihan Team</strong><br/>info@bayanihan.com</p>
    </div>`,
  },
];

export default function MailerContent() {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // contentEditable + document.execCommand is the simplest path to a
  // bold/italic toolbar without pulling in a full rich-text editor.
  // execCommand is deprecated but every major browser still honors it,
  // and this is an admin-only tool.
  const execCommand = (command: "bold" | "italic") => {
    if (typeof document === "undefined") return;
    document.execCommand(command, false);
  };

  const handleTemplateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedTemplate(value);
    const templateId = Number(value);
    const template = emailTemplates.find((t) => t.id === templateId);
    if (template && editorRef.current) {
      editorRef.current.innerHTML = template.content;
      setSubject(template.subject);
    }
  };

  const handleClear = () => {
    setSubject("");
    setRecipients("");
    setSelectedTemplate("");
    setAttachment(null);
    setPreviewUrl(null);
    setSuccess(null);
    setError(null);
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const handleSend = async () => {
    const message = editorRef.current?.innerHTML ?? "";

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("recipients", recipients);
    formData.append("message", message);
    if (attachment) formData.append("attachment", attachment);

    setSending(true);
    setSuccess(null);
    setError(null);
    try {
      // Don't set Content-Type manually for FormData — axios picks
      // multipart/form-data with the correct boundary automatically.
      await AxiosInstance.post("send-email", formData);
      setSuccess("Email sent successfully!");
      handleClear();
    } catch (e) {
      console.error("Send email failed", e);
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAttachment(file);
    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <Box p={4} sx={{ pb: { xs: 15, md: 5 } }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Email Campaign
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          select
          fullWidth
          label="Select Email Template"
          value={selectedTemplate}
          onChange={handleTemplateChange}
          sx={{
            background: "#fff",
            borderRadius: 50,
            borderStyle: "none",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "transparent",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "transparent",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "transparent",
            },
          }}
        >
          {emailTemplates.map((template) => (
            <MenuItem key={template.id} value={String(template.id)}>
              {template.name}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClear}
          sx={{ borderRadius: "30px", px: 4 }}
        >
          Clear
        </Button>
      </Stack>

      <Paper
        elevation={4}
        sx={{
          borderRadius: "18px",
          overflow: "hidden",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
          <Typography fontWeight="bold">From: info@bayanihan.com</Typography>
        </Box>

        <Divider />

        <Box sx={{ px: 3, py: 1 }}>
          <TextField
            fullWidth
            variant="standard"
            label="To (separate emails with comma)"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
          />
        </Box>

        <Divider />

        <Box sx={{ px: 3, py: 1 }}>
          <TextField
            fullWidth
            variant="standard"
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </Box>

        <Divider />

        <Box sx={{ px: 2, py: 1, backgroundColor: "#fafafa" }}>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={() => execCommand("bold")}>
              <FormatBoldIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => execCommand("italic")}>
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 3, py: 2 }}>
          <Box>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LETTERHEAD_SRC}
              alt="Bayanihan letterhead"
              style={{ maxWidth: "100%", height: "auto", display: "block" }}
            />
          </Box>
          <Box
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            sx={{
              minHeight: 250,
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              padding: "16px",
              fontSize: 15,
              outline: "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              "&:focus": { borderColor: "#06266b" },
            }}
          />
        </Box>

        <Divider />

        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle2" mb={1}>
            Attachment
          </Typography>

          <Button variant="outlined" component="label">
            Choose File
            <input type="file" hidden onChange={handleAttachmentChange} />
          </Button>

          {attachment && (
            <>
              <Typography variant="body2" mt={1}>
                Selected: {attachment.name}
              </Typography>

              {previewUrl && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    Image Preview:
                  </Typography>
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                      mt: 1,
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>

        <Divider />

        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              disabled={sending}
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSend}
              sx={{
                backgroundColor: "#06266b",
                borderRadius: "30px",
                px: 4,
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#041a4d" },
              }}
            >
              {sending ? "Sending..." : "Send email"}
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Bayanihan.com Admin Email System
          </Typography>
        </Box>
      </Paper>

      {success && (
        <Alert sx={{ mt: 3 }} severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert sx={{ mt: 3 }} severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

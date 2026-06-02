"use client";
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import {
  TextField,
  Box,
  Button,
  FormHelperText,
  Paper,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  styled,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import InfoIcon from "@mui/icons-material/Info";
import ImageIcon from "@mui/icons-material/Image";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import ArticleIcon from "@mui/icons-material/Article";
import AxiosInstance from "@/lib/AxiosInstance";
import { useAuthProvider } from "@/providers/AuthProvider";
import NewsPublishSidebar, {
  type NewsFields,
} from "./NewsPublishSidebar";
import type { Dayjs } from "dayjs";

const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "24px",
  border: "1px solid #f1f5f9",
  boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
  marginBottom: theme.spacing(4),
  background: "#ffffff",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 15px 45px rgba(0,0,0,0.06)",
    transform: "translateY(-2px)",
  },
}));

const CustomTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "#fcfdfe",
    fontFamily: "'Outfit', sans-serif",
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: "#0ea5e9", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 500,
    color: "#64748b",
  },
});

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function SectionTitle({
  children,
  icon,
  color = "#0ea5e9",
}: {
  children: ReactNode;
  icon: ReactNode;
  color?: string;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
      <Box
        sx={{
          p: 1.2,
          borderRadius: "12px",
          bgcolor: alpha(color, 0.1),
          color,
          display: "flex",
          boxShadow: `0 4px 12px ${alpha(color, 0.15)}`,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          color: "#334155",
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

const defaultFields: NewsFields = {
  title: "",
  category: "",
  country: "",
  visibility: "public",
  publication_date: null,
  image: null,
  tags: "",
  status: "published",
};

type FieldErrors = {
  [K in keyof NewsFields]?: string;
} & { content?: string };

interface GenerateTagsResponse {
  data?: string[] | { tags?: string[] };
  tags?: string[];
}

interface CreateNewsErrorResponse {
  message?: string;
  error?: string;
  exception?: string;
  errors?: Record<string, string[]>;
}

function ErrorLabel({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <FormHelperText
      sx={{
        color: "error.main",
        fontSize: 13,
        ml: 1,
        mt: 0.5,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {text}
    </FormHelperText>
  );
}

export default function CreateNewsContent() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const { authToken } = useAuthProvider();

  const [submitting, setSubmitting] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [paragraphText, setParagraphText] = useState("");
  const [newsFields, setNewsFields] = useState<NewsFields>({ ...defaultFields });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, msg: "", severity: "info" });

  const posterInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (
    msg: string,
    severity: "success" | "error" | "info" | "warning"
  ) => setSnack({ open: true, msg, severity });

  const setNewsFieldByProperty = <K extends keyof NewsFields>(
    key: K,
    value: NewsFields[K]
  ) => {
    setNewsFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeNewsField = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewsFieldByProperty(name as keyof NewsFields, value as never);
  };

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image.", "error");
      return;
    }
    setNewsFieldByProperty("image", file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleRemovePoster = () => {
    setNewsFieldByProperty("image", null);
    setPosterPreview(null);
    if (posterInputRef.current) posterInputRef.current.value = "";
  };

  const handlePosterDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image.", "error");
      return;
    }
    setNewsFieldByProperty("image", file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const clearForm = () => {
    setParagraphText("");
    setNewsFields({ ...defaultFields });
    setPosterPreview(null);
    if (posterInputRef.current) posterInputRef.current.value = "";
    setFieldErrors({});
  };

  const tagsArray = useMemo(
    () =>
      newsFields.tags
        ? newsFields.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    [newsFields.tags]
  );

  const handleRemoveTag = (index: number) => {
    const next = tagsArray.filter((_, i) => i !== index).join(", ");
    setNewsFieldByProperty("tags", next);
  };

  const getWordCount = (text: string) =>
    text.trim().split(/\s+/).filter(Boolean).length;

  const generateTags = async () => {
    const content = paragraphText.trim();
    const title = newsFields.title.trim();

    if (!content && !title) {
      showToast(
        "Type a title or some content first, then click Generate SEO Tags.",
        "warning"
      );
      return;
    }

    setGeneratingTags(true);
    try {
      const response = await AxiosInstance.post<GenerateTagsResponse>(
        "generate-tags",
        { title, content },
        { headers: { Accept: "application/json" } }
      );
      const payload = response?.data;
      const rawTags: string[] = Array.isArray(payload)
        ? (payload as string[])
        : Array.isArray(payload?.data)
        ? (payload.data as string[])
        : Array.isArray(payload?.tags)
        ? (payload.tags as string[])
        : Array.isArray(
            (payload?.data as { tags?: string[] } | undefined)?.tags
          )
        ? ((payload!.data as { tags: string[] }).tags as string[])
        : [];

      if (rawTags.length === 0) {
        showToast(
          "The tag generator didn't return any results. Try writing more content.",
          "warning"
        );
        return;
      }

      const tagsString = rawTags
        .map((t) => String(t).trim().toLowerCase())
        .filter(Boolean)
        .join(", ");
      setNewsFieldByProperty("tags", tagsString);
      showToast(`Generated ${rawTags.length} SEO tags.`, "info");
    } catch (err) {
      const e = err as {
        response?: { status?: number; data?: CreateNewsErrorResponse };
      };
      const status = e.response?.status;
      const serverMsg = e.response?.data?.message || e.response?.data?.error;
      if (status === 401) {
        showToast("Your session has expired. Please sign in again.", "error");
      } else if (status === 404) {
        showToast(
          "Tag generator endpoint not found. Check the backend route.",
          "error"
        );
      } else if (status === 429) {
        showToast(
          "Too many requests. Please wait a moment and try again.",
          "error"
        );
      } else if (status && status >= 500) {
        showToast(
          serverMsg
            ? `Server error: ${serverMsg}`
            : "Tag generator is currently unavailable.",
          "error"
        );
      } else if (e.response) {
        showToast(serverMsg ?? `Failed to generate tags (${status}).`, "error");
      } else {
        showToast("Network error. Check your connection and try again.", "error");
      }
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleSubmitNews = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    if (!newsFields.image) {
      showToast("Please upload a news poster.", "error");
      return;
    }

    // Guard against the "looks signed-in but no token" state — if the user
    // signed in on a different origin (e.g., the Vite app on a different
    // port), Next.js localStorage is empty even though they think they're
    // logged in. Without a bearer token Laravel falls through to web
    // middleware and rejects with 419 CSRF instead of 401.
    if (!authToken) {
      showToast(
        "Your session has expired or you're not signed in on this device. Please sign in again.",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", newsFields.title);
      formData.append("summary", paragraphText);
      formData.append("category", newsFields.category || "");
      formData.append("country", newsFields.country || "");
      formData.append("visibility", newsFields.visibility || "public");
      formData.append("status", newsFields.status || "published");
      formData.append("tags", newsFields.tags || "");

      if (newsFields.publication_date) {
        const d: Dayjs | Date | string = newsFields.publication_date;
        let iso: string;
        if (typeof d === "object" && "format" in d && typeof d.format === "function") {
          iso = (d as Dayjs).format("YYYY-MM-DD");
        } else if (d instanceof Date) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          iso = `${y}-${m}-${day}`;
        } else {
          iso = String(d);
        }
        formData.append("published_at", iso);
      }
      formData.append("image", newsFields.image);

      // Note: AxiosInstance's interceptor handles both the bearer token
      // and the Sanctum CSRF cookie automatically. Do NOT set Content-Type
      // manually for FormData — axios needs to set it with a unique
      // boundary; a bare `multipart/form-data` makes the body unparseable.
      const response = await AxiosInstance.post("news-articles-v2", formData);

      if (response.status === 200 || response.status === 201) {
        showToast("News successfully created.", "success");
        clearForm();
      }
    } catch (err) {
      const e = err as {
        response?: { status?: number; data?: CreateNewsErrorResponse };
      };
      const status = e.response?.status;
      const data = e.response?.data;
      const serverMsg = data?.message || data?.error || data?.exception;

      if (status === 422 && data?.errors) {
        const tmp: FieldErrors = {};
        Object.keys(data.errors).forEach((key) => {
          tmp[key as keyof FieldErrors] = (data.errors as Record<string, string[]>)[
            key
          ].join(" ");
        });
        setFieldErrors(tmp);
        showToast("Please fix the highlighted fields.", "error");
      } else if (status === 401) {
        showToast("Your session has expired. Please sign in again.", "error");
      } else if (status === 419) {
        // Laravel returns 419 for CSRF mismatch. Hitting this means the
        // backend treated this request as stateful (Sanctum + session) and
        // demanded an X-XSRF-TOKEN that we didn't send. Usually caused by
        // the API's SANCTUM_STATEFUL_DOMAINS including this dev origin, or
        // by a stray Laravel session cookie on the API domain. The bearer
        // token alone should be enough — the server config needs updating.
        showToast(
          serverMsg ||
            "Authentication conflict (419 CSRF). The API appears to be in stateful mode for this origin — try clearing cookies for the API domain and sign in again.",
          "error"
        );
      } else if (status === 403) {
        showToast(serverMsg ?? "You are not allowed to do this.", "error");
      } else if (status && status >= 500) {
        showToast(
          serverMsg
            ? `Server error: ${serverMsg}`
            : "Server error (500). Check Laravel logs for details.",
          "error"
        );
      } else if (e.response) {
        showToast(serverMsg ?? `Request failed (${status}).`, "error");
      } else {
        showToast(
          "Network error. Check your connection and try again.",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: "100%", fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      <Box sx={{ pb: 5, px: { xs: 2, md: 2 } }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            color: "#1e293b",
            fontSize: { xs: "1.8rem", md: "2.4rem" },
            py: 2,
          }}
        >
          Create News Article
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 12, lg: 8 }}>
            <Box component="form" onSubmit={handleSubmitNews}>
              {/* Section 1: Article info */}
              <FormSection>
                <SectionTitle icon={<InfoIcon sx={{ fontSize: 22 }} />} color="#0ea5e9">
                  Article Information
                </SectionTitle>

                <CustomTextField
                  label="News Title"
                  value={newsFields.title}
                  name="title"
                  onChange={handleChangeNewsField}
                  placeholder="Enter a compelling headline"
                  fullWidth
                  required
                />
                <ErrorLabel text={fieldErrors.title} />

                <CustomTextField
                  label="News Content"
                  name="content"
                  multiline
                  rows={10}
                  fullWidth
                  value={paragraphText}
                  onChange={(e) => setParagraphText(e.target.value)}
                  placeholder="Write your story here..."
                  sx={{ mt: 4 }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                    px: 1,
                  }}
                >
                  <ErrorLabel text={fieldErrors.content} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Words: {getWordCount(paragraphText)}
                  </Typography>
                </Box>

                {/* SEO tags */}
                <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #f1f5f9" }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#64748b",
                        fontSize: "0.9rem",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      SEO Tags & Keywords
                    </Typography>
                    <Button
                      size="small"
                      onClick={generateTags}
                      disabled={generatingTags || !paragraphText}
                      startIcon={
                        generatingTags ? (
                          <CircularProgress size={16} sx={{ color: "#fff" }} />
                        ) : (
                          <AutoAwesomeIcon />
                        )
                      }
                      sx={{
                        textTransform: "none",
                        fontFamily: "'Outfit', sans-serif",
                        borderRadius: "8px",
                        bgcolor: "#0ea5e9",
                        color: "#fff",
                        px: 2,
                        "&:hover": { bgcolor: "#0284c7" },
                      }}
                    >
                      {generatingTags ? "Generating..." : "Generate SEO Tags"}
                    </Button>
                  </Stack>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      minHeight: 48,
                      p: 2,
                      bgcolor: "#fcfdfe",
                      borderRadius: "12px",
                      border: "1px dashed #cbd5e1",
                    }}
                  >
                    {tagsArray.length > 0 ? (
                      tagsArray.map((tag, index) => (
                        <Chip
                          key={`${tag}-${index}`}
                          label={tag}
                          onDelete={() => handleRemoveTag(index)}
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 500,
                            bgcolor: "#fff",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#94a3b8",
                          fontStyle: "italic",
                          m: "auto",
                        }}
                      >
                        Click generate to auto-fill keywords.
                      </Typography>
                    )}
                  </Box>
                  <ErrorLabel text={fieldErrors.tags} />
                </Box>
              </FormSection>

              {/* Section 2: Poster */}
              <FormSection>
                <SectionTitle
                  icon={<ImageIcon sx={{ fontSize: 22 }} />}
                  color="#10b981"
                >
                  News Poster
                </SectionTitle>

                {posterPreview ? (
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: "18px",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <Box
                      component="img"
                      src={posterPreview}
                      alt="Poster preview"
                      sx={{
                        width: "100%",
                        maxHeight: 420,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <IconButton
                      onClick={handleRemovePoster}
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        bgcolor: "rgba(255,255,255,0.9)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        "&:hover": { bgcolor: "#fff" },
                      }}
                    >
                      <CloseIcon sx={{ color: "#475569" }} />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handlePosterDrop}
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      borderRadius: "14px",
                      py: 5,
                      borderStyle: "dashed",
                      borderWidth: 2,
                      borderColor: "#cbd5e1",
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 600,
                      color: "#64748b",
                      bgcolor: "#fcfdfe",
                      "&:hover": {
                        borderColor: "#6366f1",
                        bgcolor: alpha("#6366f1", 0.03),
                      },
                    }}
                  >
                    Click or drag an image to upload
                    <VisuallyHiddenInput
                      accept="image/*"
                      type="file"
                      name="image"
                      ref={posterInputRef}
                      onChange={handleChangeImage}
                    />
                  </Button>
                )}
                <ErrorLabel text={fieldErrors.image} />
              </FormSection>

              {desktop && (
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="contained"
                  fullWidth
                  startIcon={
                    submitting ? (
                      <CircularProgress size={20} sx={{ color: "#fff" }} />
                    ) : (
                      <ArticleIcon />
                    )
                  }
                  sx={{
                    borderRadius: "18px",
                    py: 2.5,
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    bgcolor: "#ef4444",
                    boxShadow: "0 10px 20px rgba(239,68,68,0.2)",
                    "&:hover": { bgcolor: "#dc2626" },
                  }}
                >
                  {submitting ? "Publishing News…" : "Publish News"}
                </Button>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 12, lg: 4 }}>
            <NewsPublishSidebar
              newsFields={newsFields}
              setNewsFieldByProperty={setNewsFieldByProperty}
              error={<ErrorLabel text={fieldErrors.publication_date} />}
              clearForm={clearForm}
            />
            {!desktop && (
              <Button
                type="button"
                onClick={(e) => {
                  // Mobile submit lives outside the <form>, so synthesize a
                  // submit event by calling the handler directly.
                  void handleSubmitNews(
                    e as unknown as React.FormEvent<HTMLFormElement>
                  );
                }}
                disabled={submitting}
                variant="contained"
                fullWidth
                startIcon={
                  submitting ? (
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                  ) : (
                    <ArticleIcon />
                  )
                }
                sx={{
                  borderRadius: "18px",
                  py: 2.5,
                  mt: 2,
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  bgcolor: "#0ea5e9",
                  boxShadow: "0 10px 20px rgba(14,165,233,0.2)",
                  "&:hover": { bgcolor: "#0284c7" },
                }}
              >
                {submitting ? "Publishing News…" : "Publish News"}
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

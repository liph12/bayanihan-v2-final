"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  styled,
  alpha,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import SearchIcon from "@mui/icons-material/Search";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import ReactCountryFlag from "react-country-flag";
import AxiosInstance from "@/lib/AxiosInstance";
import { countryCodes } from "@/lib/countryCodes";
import type { ConsulateOffice } from "@/types";

const FONT = "'Outfit', sans-serif";
const TEAL = "#06b6d4";
const CYAN = "#0ea5e9";

interface ConsulateApiResponse {
  data?: ConsulateOffice[] | { data?: ConsulateOffice[] };
  consulate_offices?: ConsulateOffice[];
}

interface OfficeFields {
  country: string;
  office_name: string;
  address: string;
  email: string;
  contact_number: string;
  website: string;
  facebook_link: string;
}

type FieldErrors = Partial<Record<keyof OfficeFields, string>>;

interface ServerErrorData {
  message?: string;
  error?: string;
  exception?: string;
  errors?: Record<string, string[]>;
}

const EMPTY_FIELDS: OfficeFields = {
  country: "",
  office_name: "",
  address: "",
  email: "",
  contact_number: "",
  website: "",
  facebook_link: "",
};

// --- styled, matching the modern look of CreateNewsContent ------------------
const CustomTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "#fcfdfe",
    fontFamily: FONT,
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: CYAN, borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: FONT,
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

function nameToCode(name: string): string {
  if (!name) return "";
  const lower = name.trim().toLowerCase();
  const exact = countryCodes.find((c) => c.name.toLowerCase() === lower);
  if (exact) return exact.code.toUpperCase();
  const partial = countryCodes.find(
    (c) =>
      lower.includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(lower)
  );
  return partial ? partial.code.toUpperCase() : "";
}

function extractList(payload: ConsulateApiResponse | undefined): ConsulateOffice[] {
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  const nested = (payload.data as { data?: ConsulateOffice[] })?.data;
  if (Array.isArray(nested)) return nested;
  if (Array.isArray(payload.consulate_offices)) return payload.consulate_offices;
  return [];
}

function SectionLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.5 }}>
      <Box
        sx={{
          p: 0.9,
          borderRadius: "10px",
          bgcolor: alpha(CYAN, 0.1),
          color: CYAN,
          display: "flex",
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{ fontFamily: FONT, fontWeight: 700, color: "#334155", fontSize: 15 }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

interface PhotoItem {
  file: File;
  url: string;
}

export default function ConsulateOfficeManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<ConsulateOffice[]>([]);
  const [countryFilter, setCountryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Add / edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ConsulateOffice | null>(null);
  const [fields, setFields] = useState<OfficeFields>(EMPTY_FIELDS);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Files
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ConsulateOffice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error";
  }>({ open: false, msg: "", severity: "success" });

  const showToast = (msg: string, severity: "success" | "error") =>
    setSnack({ open: true, msg, severity });

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await AxiosInstance.get<ConsulateApiResponse>(
          "consulate-offices?per_page=1000"
        );
        if (!cancelled) setRows(extractList(res?.data));
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to fetch consulate offices", e);
          setError("Failed to load consulate offices.");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Revoke object URLs on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      photoItems.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableCountries = useMemo(() => {
    const set = new Set(
      rows.map((r) => (r.country || "").trim()).filter(Boolean)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...rows]
      .sort((a, b) => (a.country || "").localeCompare(b.country || ""))
      .filter((r) => {
        if (countryFilter !== "all" && (r.country || "") !== countryFilter) {
          return false;
        }
        if (!q) return true;
        return (
          (r.country || "").toLowerCase().includes(q) ||
          (r.office_name || "").toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q)
        );
      });
  }, [rows, countryFilter, search]);

  const pagedRows = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  // --- file helpers ---------------------------------------------------------
  const clearFiles = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    photoItems.forEach((p) => URL.revokeObjectURL(p.url));
    setLogoFile(null);
    setLogoPreview(null);
    setExistingLogo(null);
    setPhotoItems([]);
    setExistingPhotos([]);
    if (logoInputRef.current) logoInputRef.current.value = "";
    if (photosInputRef.current) photosInputRef.current.value = "";
  };

  const handleLogoSelect = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose a valid image for the logo.", "error");
      return;
    }
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    setExistingLogo(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handlePhotosSelect = (files: FileList | null) => {
    const list = Array.from(files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!list.length) return;
    const items = list.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotoItems((prev) => [...prev, ...items]);
    if (photosInputRef.current) photosInputRef.current.value = "";
  };

  const removeNewPhoto = (idx: number) => {
    setPhotoItems((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingPhoto = (url: string) => {
    setExistingPhotos((prev) => prev.filter((u) => u !== url));
  };

  const shownLogo = logoPreview || existingLogo;

  // --- dialog helpers -------------------------------------------------------
  const openAdd = () => {
    clearFiles();
    setEditing(null);
    setFields(EMPTY_FIELDS);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const openEdit = (office: ConsulateOffice) => {
    clearFiles();
    setEditing(office);
    setFields({
      country: office.country || "",
      office_name: office.office_name || "",
      address: office.address || "",
      email: office.email || "",
      contact_number: office.contact_number || "",
      website: office.website || "",
      facebook_link: office.facebook_link || "",
    });
    setExistingLogo(office.office_logo || null);
    setExistingPhotos(Array.isArray(office.photos) ? office.photos : []);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
  };

  const setField = <K extends keyof OfficeFields>(
    key: K,
    value: OfficeFields[K]
  ) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!fields.country.trim()) errs.country = "Country is required.";
    if (!fields.office_name.trim()) errs.office_name = "Office name is required.";
    if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      errs.email = "Enter a valid email address.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("country", fields.country.trim());
      fd.append("office_name", fields.office_name.trim());
      fd.append("address", fields.address.trim());
      fd.append("email", fields.email.trim());
      fd.append("contact_number", fields.contact_number.trim());
      fd.append("website", fields.website.trim());
      fd.append("facebook_link", fields.facebook_link.trim());
      if (logoFile) fd.append("office_logo", logoFile);
      photoItems.forEach((p) => fd.append("photos[]", p.file));

      // NB: don't set Content-Type — axios sets the multipart boundary itself.
      if (editing?.id != null) {
        // Keep only the existing photos the admin didn't remove.
        existingPhotos.forEach((u) => fd.append("existing_photos[]", u));
        // Logo was present but cleared without a replacement → ask API to drop it.
        if (!logoFile && !existingLogo && editing.office_logo) {
          fd.append("remove_logo", "1");
        }
        // Laravel can't parse multipart on PUT — spoof the method over POST.
        fd.append("_method", "PUT");
        await AxiosInstance.post(`consulate-offices/${editing.id}`, fd);
        showToast("Consulate office updated.", "success");
      } else {
        await AxiosInstance.post("consulate-offices", fd);
        showToast("Consulate office added.", "success");
      }
      setDialogOpen(false);
      reload();
    } catch (err) {
      const e = err as {
        response?: { status?: number; data?: ServerErrorData };
      };
      const status = e.response?.status;
      const data = e.response?.data;
      const serverMsg = data?.message || data?.error || data?.exception;

      if (status === 422 && data?.errors) {
        const tmp: FieldErrors = {};
        Object.keys(data.errors).forEach((key) => {
          if (key in EMPTY_FIELDS) {
            tmp[key as keyof OfficeFields] = data.errors![key].join(" ");
          }
        });
        setFieldErrors(tmp);
        showToast("Please fix the highlighted fields.", "error");
      } else if (status === 401) {
        showToast("Your session has expired. Please sign in again.", "error");
      } else if (status === 403) {
        showToast(serverMsg ?? "You are not allowed to do this.", "error");
      } else if (status === 413) {
        showToast("The images are too large. Try smaller files.", "error");
      } else if (status && status >= 500) {
        showToast(
          serverMsg
            ? `Server error: ${serverMsg}`
            : "Server error (500). Check the API logs.",
          "error"
        );
      } else if (e.response) {
        showToast(serverMsg ?? `Request failed (${status}).`, "error");
      } else {
        showToast("Network error. Check your connection and try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?.id == null) return;
    setDeleting(true);
    try {
      await AxiosInstance.delete(`consulate-offices/${deleteTarget.id}`);
      showToast("Consulate office deleted.", "success");
      setDeleteTarget(null);
      reload();
    } catch (err) {
      const e = err as { response?: { status?: number; data?: ServerErrorData } };
      const serverMsg = e.response?.data?.message || e.response?.data?.error;
      showToast(serverMsg ?? "Failed to delete the office.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const headCellSx = {
    backgroundColor: "#f8fafc",
    fontWeight: 700,
    color: "#374151",
    fontFamily: FONT,
  } as const;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 12, lg: 5 }, minHeight: "100vh" }}>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: "100%", fontWeight: 600, fontFamily: FONT }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${CYAN} 0%, ${TEAL} 100%)`,
          borderRadius: 3,
          p: 3,
          color: "#fff",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          boxShadow: "0 8px 32px rgba(14,165,233,0.2)",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: FONT,
              fontSize: { xs: "1.6rem", sm: "2rem" },
              mb: 0.5,
            }}
          >
            🏛️ Consulate Offices
          </Typography>
          <Typography
            sx={{ fontFamily: FONT, opacity: 0.95, fontSize: "0.95rem" }}
          >
            Manage the Filipino consulate &amp; embassy directory shown on the
            public site.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={openAdd}
          sx={{
            bgcolor: "#fff",
            color: CYAN,
            fontFamily: FONT,
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2,
            px: 2.5,
            flexShrink: 0,
            "&:hover": { bgcolor: "#f0f9ff" },
          }}
        >
          Add Office
        </Button>
      </Box>

      {/* Filters */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e5e7eb",
          backgroundColor: "#fff",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="consulate-country-filter" sx={{ fontFamily: FONT }}>
                Filter by Country
              </InputLabel>
              <Select
                labelId="consulate-country-filter"
                label="Filter by Country"
                value={countryFilter}
                onChange={(e: SelectChangeEvent) => {
                  setCountryFilter(e.target.value);
                  setPage(0);
                }}
                MenuProps={{
                  disableScrollLock: true,
                  PaperProps: { sx: { maxHeight: 320 } },
                }}
                sx={{ fontFamily: FONT }}
              >
                <MenuItem value="all" sx={{ fontFamily: FONT }}>
                  All Countries
                </MenuItem>
                {availableCountries.map((c) => (
                  <MenuItem key={c} value={c} sx={{ fontFamily: FONT }}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search country, office, or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { fontFamily: FONT } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              variant="outlined"
              onClick={() => {
                setCountryFilter("all");
                setSearch("");
                setPage(0);
              }}
              sx={{
                textTransform: "none",
                fontFamily: FONT,
                color: "#6b7280",
                borderColor: "#d1d5db",
              }}
            >
              Clear
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontFamily: FONT }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Typography
          variant="body2"
          sx={{ mb: 1.5, color: "#6b7280", fontFamily: FONT }}
        >
          {filtered.length === rows.length
            ? `${rows.length} office${rows.length === 1 ? "" : "s"}`
            : `Showing ${filtered.length} of ${rows.length} offices`}
        </Typography>
      )}

      {/* Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Country</TableCell>
                <TableCell sx={headCellSx}>Office</TableCell>
                <TableCell sx={headCellSx}>Email</TableCell>
                <TableCell sx={headCellSx}>Contact</TableCell>
                <TableCell sx={headCellSx}>Website</TableCell>
                <TableCell sx={headCellSx} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CircularProgress size={24} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: FONT }}
                      >
                        Loading offices…
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary" sx={{ fontFamily: FONT }}>
                      {rows.length === 0
                        ? "No consulate offices yet. Click “Add Office” to create one."
                        : "No offices match the current filters."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row, idx) => {
                  const code = nameToCode(row.country || "");
                  const photoCount = Array.isArray(row.photos)
                    ? row.photos.length
                    : 0;
                  return (
                    <TableRow
                      key={String(row.id ?? idx)}
                      sx={{
                        backgroundColor: idx % 2 === 0 ? "#fff" : "#fafbfc",
                        "&:hover": { backgroundColor: "#f9fafb" },
                      }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {code && (
                            <ReactCountryFlag
                              countryCode={code}
                              svg
                              style={{ width: 18, height: 18, borderRadius: 2 }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: FONT, fontWeight: 500 }}
                          >
                            {row.country || "—"}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={row.office_logo || undefined}
                            alt={row.office_name}
                            variant="rounded"
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: alpha(CYAN, 0.1),
                              color: CYAN,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <AccountBalanceRoundedIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: FONT,
                                fontWeight: 600,
                                color: "#1f2937",
                              }}
                            >
                              {row.office_name || "—"}
                            </Typography>
                            {row.address && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: FONT,
                                  color: "#94a3b8",
                                  display: "block",
                                  maxWidth: 260,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={row.address}
                              >
                                {row.address}
                              </Typography>
                            )}
                            {photoCount > 0 && (
                              <Chip
                                size="small"
                                label={`${photoCount} photo${
                                  photoCount === 1 ? "" : "s"
                                }`}
                                sx={{
                                  mt: 0.5,
                                  height: 18,
                                  fontSize: 11,
                                  fontFamily: FONT,
                                  color: TEAL,
                                  bgcolor: alpha(TEAL, 0.08),
                                }}
                              />
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: FONT, color: "#6b7280" }}
                        >
                          {row.email || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: FONT, color: "#6b7280" }}
                        >
                          {row.contact_number || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {row.website ? (
                          <Box
                            component="a"
                            href={
                              /^https?:\/\//i.test(row.website)
                                ? row.website
                                : `https://${row.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: CYAN,
                              textDecoration: "none",
                              fontFamily: FONT,
                              fontSize: "0.9rem",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            <LinkRounded sx={{ fontSize: 18 }} />
                            Visit
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontFamily: FONT }}
                          >
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }} align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(row)}
                            sx={{ color: CYAN }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(row)}
                            sx={{ color: "#ef4444" }}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && filtered.length > 0 && (
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ borderTop: "1px solid #e5e7eb", fontFamily: FONT }}
          />
        )}
      </Card>

      {/* Add / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: "20px" } } }}
      >
        <DialogTitle
          sx={{
            fontFamily: FONT,
            fontWeight: 800,
            color: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {editing ? "Edit Consulate Office" : "Add Consulate Office"}
          <IconButton onClick={closeDialog} disabled={submitting} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "#f8fafc" }}>
          <Stack spacing={3.5} sx={{ pt: 1 }}>
            {/* Logo + identity */}
            <Box>
              <SectionLabel icon={<AccountBalanceRoundedIcon />}>
                Office identity
              </SectionLabel>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2.5,
                  alignItems: { sm: "flex-start" },
                }}
              >
                {/* Logo uploader */}
                <Stack spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <Box
                    onClick={() => logoInputRef.current?.click()}
                    sx={{
                      width: 104,
                      height: 104,
                      borderRadius: "20px",
                      border: "2px dashed #cbd5e1",
                      bgcolor: "#fff",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      overflow: "hidden",
                      transition: "all .2s ease",
                      "&:hover": {
                        borderColor: CYAN,
                        bgcolor: alpha(CYAN, 0.04),
                      },
                    }}
                  >
                    {shownLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={shownLogo}
                        alt="Office logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Stack alignItems="center" spacing={0.5} sx={{ color: "#94a3b8" }}>
                        <AddPhotoAlternateRoundedIcon />
                        <Typography sx={{ fontFamily: FONT, fontSize: 11 }}>
                          Logo
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                  <VisuallyHiddenInput
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleLogoSelect(e.target.files?.[0])
                    }
                  />
                  {shownLogo && (
                    <Button
                      size="small"
                      onClick={removeLogo}
                      sx={{
                        fontFamily: FONT,
                        textTransform: "none",
                        color: "#ef4444",
                        fontSize: 12,
                        minWidth: 0,
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>

                {/* Country + name */}
                <Stack spacing={2.5} sx={{ flex: 1, width: "100%" }}>
                  <CustomTextField
                    select
                    label="Country *"
                    value={fields.country}
                    onChange={(e) => setField("country", e.target.value)}
                    error={!!fieldErrors.country}
                    helperText={fieldErrors.country}
                    fullWidth
                    SelectProps={{
                      MenuProps: {
                        disableScrollLock: true,
                        PaperProps: { sx: { maxHeight: 320 } },
                      },
                    }}
                  >
                    {countryCodes.map((c) => (
                      <MenuItem key={c.code} value={c.name} sx={{ fontFamily: FONT }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ReactCountryFlag
                            countryCode={c.code}
                            svg
                            style={{ width: 18, height: 18, borderRadius: 2 }}
                          />
                          <span>{c.name}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </CustomTextField>

                  <CustomTextField
                    label="Consulate Office Name *"
                    value={fields.office_name}
                    onChange={(e) => setField("office_name", e.target.value)}
                    error={!!fieldErrors.office_name}
                    helperText={fieldErrors.office_name}
                    fullWidth
                  />
                </Stack>
              </Box>
            </Box>

            <Divider />

            {/* Contact details */}
            <Box>
              <SectionLabel icon={<LinkRounded />}>Contact details</SectionLabel>
              <Stack spacing={2.5}>
                <CustomTextField
                  label="Address"
                  value={fields.address}
                  onChange={(e) => setField("address", e.target.value)}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Box
                  sx={{
                    display: "grid",
                    gap: 2.5,
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  }}
                >
                  <CustomTextField
                    label="Email"
                    type="email"
                    value={fields.email}
                    onChange={(e) => setField("email", e.target.value)}
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email}
                    fullWidth
                  />
                  <CustomTextField
                    label="Contact Number"
                    value={fields.contact_number}
                    onChange={(e) => setField("contact_number", e.target.value)}
                    error={!!fieldErrors.contact_number}
                    helperText={fieldErrors.contact_number}
                    fullWidth
                  />
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2.5,
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  }}
                >
                  <CustomTextField
                    label="Website"
                    placeholder="https://…"
                    value={fields.website}
                    onChange={(e) => setField("website", e.target.value)}
                    error={!!fieldErrors.website}
                    helperText={fieldErrors.website}
                    fullWidth
                  />
                  <CustomTextField
                    label="Facebook Page Link"
                    placeholder="https://facebook.com/…"
                    value={fields.facebook_link}
                    onChange={(e) => setField("facebook_link", e.target.value)}
                    error={!!fieldErrors.facebook_link}
                    helperText={fieldErrors.facebook_link}
                    fullWidth
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Photos */}
            <Box>
              <SectionLabel icon={<CollectionsRoundedIcon />}>Photos</SectionLabel>
              <Box
                component="label"
                onDragOver={(e: DragEvent<HTMLLabelElement>) => e.preventDefault()}
                onDrop={(e: DragEvent<HTMLLabelElement>) => {
                  e.preventDefault();
                  handlePhotosSelect(e.dataTransfer.files);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  py: 3,
                  px: 2,
                  borderRadius: "16px",
                  border: "2px dashed #cbd5e1",
                  bgcolor: "#fff",
                  cursor: "pointer",
                  color: "#64748b",
                  transition: "all .2s ease",
                  "&:hover": { borderColor: CYAN, bgcolor: alpha(CYAN, 0.04) },
                }}
              >
                <CloudUploadRoundedIcon sx={{ color: CYAN }} />
                <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: 14 }}>
                  Click or drop images to upload
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: 12, color: "#94a3b8" }}>
                  You can add multiple photos of the office
                </Typography>
                <VisuallyHiddenInput
                  ref={photosInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handlePhotosSelect(e.target.files)
                  }
                />
              </Box>

              {(existingPhotos.length > 0 || photoItems.length > 0) && (
                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: {
                      xs: "repeat(3, 1fr)",
                      sm: "repeat(5, 1fr)",
                    },
                  }}
                >
                  {existingPhotos.map((url) => (
                    <PhotoThumb
                      key={url}
                      src={url}
                      onRemove={() => removeExistingPhoto(url)}
                    />
                  ))}
                  {photoItems.map((item, i) => (
                    <PhotoThumb
                      key={item.url}
                      src={item.url}
                      onRemove={() => removeNewPhoto(i)}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={closeDialog}
            disabled={submitting}
            sx={{ fontFamily: FONT, textTransform: "none", color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant="contained"
            startIcon={
              submitting ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : undefined
            }
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              background: `linear-gradient(135deg, ${CYAN} 0%, ${TEAL} 100%)`,
            }}
          >
            {editing ? "Save Changes" : "Add Office"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 800 }}>
          Delete consulate office?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: FONT, color: "#475569" }}>
            This will permanently remove{" "}
            <strong>{deleteTarget?.office_name || "this office"}</strong>
            {deleteTarget?.country ? ` (${deleteTarget.country})` : ""} from the
            directory. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            sx={{ fontFamily: FONT, textTransform: "none", color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="contained"
            color="error"
            startIcon={
              deleting ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <DeleteRoundedIcon />
              )
            }
            sx={{
              fontFamily: FONT,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function PhotoThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <Box
      sx={{
        position: "relative",
        paddingTop: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        bgcolor: "#fff",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Office photo"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          bgcolor: "rgba(15,23,42,0.6)",
          color: "#fff",
          width: 22,
          height: 22,
          "&:hover": { bgcolor: "rgba(239,68,68,0.9)" },
        }}
      >
        <CloseRoundedIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}

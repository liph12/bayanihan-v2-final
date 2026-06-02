"use client";
import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import {
  TextField,
  MenuItem,
  Box,
  Button,
  FormHelperText,
  Paper,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled, alpha } from "@mui/material/styles";
import axios from "axios";
import AxiosInstance from "@/lib/AxiosInstance";
import dayjs, { type Dayjs } from "dayjs";

import InfoIcon from "@mui/icons-material/Info";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import EventSidebar, { type EventFields } from "./EventSidebar";
import CreateMedia from "./CreateMedia";
import LogoDropImage from "./LogoDropImage";
import EventSubdomainField from "./EventSubdomainField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { countryCodes } from "@/lib/countryCodes";
import { useAuthProvider } from "@/providers/AuthProvider";

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
    "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: "2px" },
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
  color = "#6366f1",
}: {
  children: React.ReactNode;
  icon: ReactElement;
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

interface DefaultFields {
  title: string;
  published_date: Dayjs | null;
  event_date: Dayjs | null;
  start_time: string;
  end_time: string;
  location: string;
  organizer: string;
  organizer_email: string;
  organizer_mobile: string;
  status: string;
  ticket_price: number;
  image: File | null;
  logo: File | null;
  gallery: unknown;
  country_code: string;
  sub_domain: string;
}

const defaultFields: DefaultFields = {
  title: "",
  published_date: null,
  event_date: null,
  start_time: "06:00",
  end_time: "12:00",
  location: "",
  organizer: "",
  organizer_email: "",
  organizer_mobile: "",
  status: "Public",
  ticket_price: 0,
  image: null,
  logo: null,
  gallery: null,
  country_code: "",
  sub_domain: "",
};

function ErrorLabel({ text }: { text?: string }) {
  return text ? (
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
  ) : null;
}

export default function CreateEventContent() {
  const { authToken } = useAuthProvider();
  const [onProgressSubmit, setOnProgressSubmit] = useState(false);
  const [paragraphText, setParagraphText] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error";
  }>({ message: "", severity: "info" });
  const [eventFields, setEventFields] = useState<DefaultFields>({
    ...defaultFields,
  });
  const fieldErrors: Partial<Record<keyof DefaultFields, string>> = {};
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number | null>(
    null
  );
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isValidSubDomain, setIsValidSubDomain] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (
    message: string,
    severity: "success" | "info" | "warning" | "error"
  ) => {
    setFeedback({ message, severity });
    setToastOpen(true);
  };

  const setEventFieldByProperty = (key: string, value: unknown) => {
    setEventFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeEventField = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventFieldByProperty(name, value);
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type.includes("image/")) setEventFieldByProperty("logo", file);
      else showToast("Please upload a valid image.", "error");
    }
  };

  const handleLogoDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      setEventFieldByProperty("logo", file);
    }
  };

  const handleChangeMedia = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleSetFeaturedImage = (index: number) => {
    setEventFieldByProperty("image", selectedFiles[index]);
    setFeaturedImageIndex(index);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (featuredImageIndex === index) setFeaturedImageIndex(null);
  };

  const handleRemoveLogo = () => {
    setEventFieldByProperty("logo", null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleRemoveTag = (index: number) => {
    setSeoTags((prev) => prev.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    setParagraphText("");
    setEventFields({ ...defaultFields });
    setSelectedFiles([]);
    setFeaturedImageIndex(null);
    setSeoTags([]);
  };

  const handleSubmitEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (featuredImageIndex === null || !eventFields.logo) {
      return showToast(
        "Please provide both a logo and a featured image.",
        "error"
      );
    }

    try {
      setOnProgressSubmit(true);
      const formData = new FormData();
      formData.append("description", paragraphText);
      formData.append(
        "event_date",
        dayjs(eventFields.event_date as Dayjs | null).format("MMMM DD, YYYY")
      );
      formData.append(
        "published_date",
        dayjs(eventFields.published_date as Dayjs | null).format(
          "MMMM DD, YYYY"
        )
      );

      (Object.keys(eventFields) as Array<keyof DefaultFields>).forEach((key) => {
        if (
          !["gallery", "description", "event_date", "published_date"].includes(
            String(key)
          )
        ) {
          const v = eventFields[key];
          if (v !== null && v !== undefined) {
            formData.append(String(key), v as Blob | string);
          }
        }
      });

      selectedFiles.forEach((file, index) => {
        if (index !== featuredImageIndex)
          formData.append(`gallery[${index}]`, file);
      });

      formData.append("seo_tags", JSON.stringify(seoTags));

      const response = await axios.post("/api/profile/create-event", formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        showToast("Event successfully created.", "success");
        clearForm();
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "An error occurred.";
      showToast(msg, "error");
    } finally {
      setOnProgressSubmit(false);
    }
  };

  const generateSEOTags = async () => {
    if (!paragraphText) return;
    setIsGeneratingTags(true);
    try {
      const res = await AxiosInstance.get(
        `profile/generate-seo-tags-description/${encodeURIComponent(
          paragraphText
        )}`
      );
      if (res.status === 200) {
        const data = res.data as Array<{ tags?: string[] }>;
        setSeoTags(data?.[0]?.tags ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  useEffect(() => {
    const debounceFetch = setTimeout(async () => {
      if (!eventFields.title) return;
      setIsGeneratingTitle(true);
      try {
        const res = await AxiosInstance.get(
          `profile/generate-description/${encodeURIComponent(
            eventFields.title
          )}`
        );
        if (res.status === 200) {
          const d = res.data as { data?: string };
          setParagraphText(d?.data ?? "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsGeneratingTitle(false);
      }
    }, 1000);
    return () => clearTimeout(debounceFetch);
  }, [eventFields.title]);

  return (
    <>
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {feedback.message}
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
          Create New Event
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ lg: 8, md: 12, xs: 12 }}>
            <Box component="form" onSubmit={handleSubmitEvent}>
              {/* Section 1: General Info */}
              <FormSection>
                <SectionTitle
                  icon={<InfoIcon sx={{ fontSize: 22 }} />}
                  color="#6366f1"
                >
                  General Information
                </SectionTitle>

                <EventSubdomainField
                  setEventFieldByProperty={setEventFieldByProperty}
                  subDomainValue={eventFields.sub_domain}
                  setIsValidSubDomain={setIsValidSubDomain}
                />

                <CustomTextField
                  label="Event Title"
                  value={eventFields.title}
                  name="title"
                  onChange={handleChangeEventField}
                  placeholder="Enter a catchy name for your event"
                  fullWidth
                  required
                  sx={{ mt: 3 }}
                />
                <ErrorLabel text={fieldErrors.title} />

                <CustomTextField
                  label={
                    isGeneratingTitle
                      ? "✨ Generating Description..."
                      : "Event Description"
                  }
                  name="description"
                  multiline
                  rows={6}
                  fullWidth
                  value={paragraphText}
                  onChange={(e) => setParagraphText(e.target.value)}
                  disabled={isGeneratingTitle}
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
                  <Box />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Words:{" "}
                    {paragraphText.trim().split(/\s+/).filter(Boolean).length}
                  </Typography>
                </Box>

                {/* SEO Section */}
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
                      onClick={generateSEOTags}
                      disabled={isGeneratingTags || !paragraphText}
                      startIcon={
                        isGeneratingTags ? (
                          <CircularProgress size={16} />
                        ) : (
                          <AutoAwesomeIcon />
                        )
                      }
                      sx={{
                        textTransform: "none",
                        fontFamily: "'Outfit', sans-serif",
                        borderRadius: "8px",
                        bgcolor: "#6366f1",
                        color: "#fff",
                        px: 2,
                        "&:hover": { bgcolor: "#4f46e5" },
                      }}
                    >
                      {isGeneratingTags ? "Generating..." : "Generate SEO Tags"}
                    </Button>
                  </Stack>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      minHeight: "48px",
                      p: 2,
                      bgcolor: "#fcfdfe",
                      borderRadius: "12px",
                      border: "1px dashed #cbd5e1",
                    }}
                  >
                    {seoTags.length > 0 ? (
                      seoTags.map((tag, index) => (
                        <Chip
                          key={index}
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
                </Box>
              </FormSection>

              {/* Section 2: Location & Time */}
              <FormSection>
                <SectionTitle
                  icon={<LocationOnIcon sx={{ fontSize: 22 }} />}
                  color="#f59e0b"
                >
                  Location & Schedule
                </SectionTitle>

                <Grid container spacing={3}>
                  <Grid size={12}>
                    <CustomTextField
                      select
                      name="country_code"
                      label="Select Country"
                      value={eventFields.country_code}
                      onChange={handleChangeEventField}
                      fullWidth
                      slotProps={{
                        select: {
                          renderValue: (selected: unknown) => {
                            const code = String(selected || "");
                            const country = countryCodes.find(
                              (c) => c.code === code
                            );
                            if (!country) return "";
                            return (
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{ width: "100%" }}
                              >
                                <Typography
                                  sx={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                  {country.name}
                                </Typography>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  alt={country.name}
                                  style={{
                                    width: 20,
                                    height: 14,
                                    borderRadius: 2,
                                    marginLeft: "auto",
                                  }}
                                  src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code.toUpperCase()}.svg`}
                                />
                              </Stack>
                            );
                          },
                        },
                      }}
                    >
                      {countryCodes.map((c) => (
                        <MenuItem
                          key={c.code}
                          value={c.code}
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          {c.name}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={c.name}
                            style={{ width: 20, height: 14, borderRadius: 2 }}
                            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${c.code.toUpperCase()}.svg`}
                          />
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  </Grid>

                  <Grid size={12}>
                    <CustomTextField
                      value={eventFields.location}
                      label="Event Address / Venue"
                      name="location"
                      onChange={handleChangeEventField}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Event Date"
                        value={eventFields.event_date}
                        onChange={(val: Dayjs | null) =>
                          setEventFieldByProperty("event_date", val)
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "14px",
                                fontFamily: "'Outfit', sans-serif",
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <CustomTextField
                      type="time"
                      value={eventFields.start_time}
                      label="Start Time"
                      name="start_time"
                      onChange={handleChangeEventField}
                      fullWidth
                      required
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <CustomTextField
                      type="time"
                      value={eventFields.end_time}
                      label="End Time"
                      name="end_time"
                      onChange={handleChangeEventField}
                      fullWidth
                      required
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>
                </Grid>
              </FormSection>

              {/* Section 3: Organizer & Media */}
              <FormSection>
                <SectionTitle
                  icon={<ContactSupportIcon sx={{ fontSize: 22 }} />}
                  color="#10b981"
                >
                  Organizer & Media
                </SectionTitle>

                <Grid container spacing={3}>
                  <Grid size={12}>
                    <CustomTextField
                      value={eventFields.organizer}
                      label="Organizer Name"
                      name="organizer"
                      onChange={handleChangeEventField}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      value={eventFields.organizer_email}
                      label="Contact Email"
                      name="organizer_email"
                      onChange={handleChangeEventField}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      value={eventFields.organizer_mobile}
                      label="Mobile Number"
                      name="organizer_mobile"
                      onChange={handleChangeEventField}
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#64748b",
                      mb: 2,
                      fontSize: "0.9rem",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Official Event Logo
                  </Typography>
                  <LogoDropImage
                    handleLogoDrop={handleLogoDrop}
                    logoInputRef={logoInputRef}
                    handleLogoChange={handleLogoChange}
                    logoImage={eventFields.logo}
                    handleRemoveLogo={handleRemoveLogo}
                  />
                </Box>

                <Box sx={{ mt: 5 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#64748b",
                      mb: 2,
                      fontSize: "0.9rem",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Event Gallery & Featured Image
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      borderRadius: "14px",
                      py: 3,
                      borderStyle: "dashed",
                      borderWidth: "2px",
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Click to upload images{" "}
                    {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    <VisuallyHiddenInput
                      accept="image/*"
                      type="file"
                      ref={fileInputRef}
                      multiple
                      onChange={handleChangeMedia}
                    />
                  </Button>

                  {selectedFiles.length > 0 && (
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: "#f8fafc",
                        borderRadius: "18px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <CreateMedia
                        selectedFiles={selectedFiles}
                        handleSetFeaturedImage={handleSetFeaturedImage}
                        featuredImageIndex={featuredImageIndex}
                        handleRemoveImage={handleRemoveImage}
                      />
                    </Box>
                  )}
                </Box>
              </FormSection>

              <Button
                disabled={!isValidSubDomain || onProgressSubmit}
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: "18px",
                  py: 2.5,
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  bgcolor: "#6366f1",
                  boxShadow: "0 10px 20px rgba(99,102,241,0.2)",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#4f46e5" },
                }}
              >
                {onProgressSubmit ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Publish Event"
                )}
              </Button>
            </Box>
          </Grid>

          <Grid size={{ lg: 4, md: 12, xs: 12 }}>
            <Box sx={{ position: "sticky", top: "100px" }}>
              <EventSidebar
                eventFields={eventFields as unknown as EventFields}
                setEventFieldByProperty={setEventFieldByProperty}
                clearForm={clearForm}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

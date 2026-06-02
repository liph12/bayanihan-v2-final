"use client";
import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormHelperText,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { alpha, styled } from "@mui/material/styles";
import axios from "axios";

import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import InfoIcon from "@mui/icons-material/Info";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { useAuthProvider } from "@/providers/AuthProvider";
import { countryCodes } from "@/lib/countryCodes";
import LocationPreview from "./LocationPreview";

// ─── Styled Components ────────────────────────────────────────────────────────

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
    "&.Mui-focused": { color: "#6366f1" },
  },
  "& .MuiInputBase-input": { fontFamily: "'Outfit', sans-serif" },
  "& .MuiSelect-select": { fontFamily: "'Outfit', sans-serif" },
});

const UploadZone = styled(Box)<{ hasimage: number }>(({ hasimage }) => ({
  border: hasimage ? "2px solid transparent" : "2px dashed #cbd5e1",
  borderRadius: 16,
  background: hasimage ? "transparent" : "#fcfdfe",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.25s ease",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    border: "2px dashed #6366f1",
    background: "rgba(99,102,241,0.03)",
    "& .upload-overlay": { opacity: 1 },
  },
}));

const CategoryChip = styled(Chip)<{ selected: number }>(({ selected }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 600,
  fontSize: "0.85rem",
  padding: "4px 2px",
  borderRadius: 10,
  cursor: "pointer",
  transition: "all 0.2s ease",
  ...(selected
    ? {
        background: "#6366f1",
        color: "#fff",
        border: "none",
        boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
        transform: "translateY(-1px)",
      }
    : {
        background: "rgba(99,102,241,0.06)",
        borderColor: "rgba(99,102,241,0.25)",
        color: "#334155",
        "&:hover": {
          background: "rgba(99,102,241,0.12)",
          borderColor: "#6366f1",
          transform: "translateY(-1px)",
        },
      }),
}));

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const toSubdomain = (text: string): string => {
  let s = (text || "").toString().toLowerCase();
  try {
    s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  } catch {}
  s = s
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!/^[a-z]/.test(s)) s = `r-${s}`;
  if (s.length < 3) s = (s + "-resto").slice(0, 63);
  if (s.length > 63) s = s.slice(0, 63).replace(/-+$/g, "");
  return s || "resto";
};

interface CompressOpts {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeKB?: number;
  mimeType?: string;
  qualityStart?: number;
}

async function compressImage(
  file: File,
  opts: CompressOpts = {}
): Promise<{ dataUrl: string | null; outFile: File }> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    maxSizeKB = 2000,
    mimeType = "image/jpeg",
    qualityStart = 0.9,
  } = opts;
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    let width = img.width;
    let height = img.height;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { dataUrl: null, outFile: file };
    ctx.drawImage(img, 0, 0, width, height);
    let q = qualityStart;
    let outDataUrl = canvas.toDataURL(mimeType, q);
    const sizeKB = (s: string) => Math.ceil((s.length * 3) / 4 / 1024);
    let attempts = 0;
    while (sizeKB(outDataUrl) > maxSizeKB && attempts < 8) {
      q = Math.max(0.4, q - 0.1);
      if (attempts >= 4) {
        canvas.width = Math.round(canvas.width * 0.9);
        canvas.height = Math.round(canvas.height * 0.9);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      outDataUrl = canvas.toDataURL(mimeType, q);
      attempts++;
    }
    const blob = await (await fetch(outDataUrl)).blob();
    const ext = mimeType.includes("png") ? ".png" : ".jpg";
    const outFile = new File([blob], (file.name || "image") + ext, {
      type: mimeType,
    });
    return { dataUrl: outDataUrl, outFile };
  } catch (e) {
    console.warn("Compression failed, using original file", e);
    return { dataUrl: null, outFile: file };
  }
}

function dataURLToFile(dataUrl: string, filename: string): File | null {
  try {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  } catch {
    return null;
  }
}

const PRESET_CATEGORIES = [
  "Appetizers",
  "Main Course",
  "Desserts",
  "Beverages",
  "Salads",
  "Soups",
  "Pasta",
  "Grill",
];

const COUNTRY_CURRENCY: Record<string, string> = {
  Philippines: "PHP",
  Japan: "JPY",
  "United States of America": "USD",
  USA: "USD",
  "United Arab Emirates": "AED",
  UAE: "AED",
  Singapore: "SGD",
  Australia: "AUD",
  Canada: "CAD",
  "Saudi Arabia": "SAR",
  Qatar: "QAR",
  "United Kingdom": "GBP",
  UK: "GBP",
  "South Korea": "KRW",
  Korea: "KRW",
  Taiwan: "TWD",
  China: "CNY",
  HongKong: "HKD",
  "Hong Kong": "HKD",
  Malaysia: "MYR",
  Thailand: "THB",
  Vietnam: "VND",
};

const RESTAURANT_CATEGORIES = [
  "FastFood",
  "Fine Dining",
  "Casual Dining",
  "Seafood",
  "Cafe",
  "Japanese",
  "Mexican",
  "Italian",
  "BBQ",
];

interface RecipeItem {
  recipe_id: number;
  name: string;
  price: string;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  saving?: boolean;
  saved?: boolean;
  server_id?: number;
}

interface MenuEntry {
  menu_id: number;
  rest_id: number | null;
  name: string;
  recipes: RecipeItem[];
}

interface RestaurantFields {
  name: string;
  description: string;
  slug: string;
  country_code: string;
  address: string;
  city: string;
  postal_code: string;
  contact_number: string;
  email: string;
  category: string;
  operating_hours: string;
  logo: File | null;
  feature_image: File | null;
  geo_coordinate: string;
}

interface RestaurantSnapshot {
  id: number | null;
  name?: string;
  city?: string;
  country_code?: string;
  category?: string;
  email?: string;
  contact_number?: string;
  address?: string;
  postal?: string;
  logo?: string | null;
  feature_image?: string | null;
  created_at?: string;
}

const STORAGE_KEYS = {
  draft: "createRestaurant.draft",
  logo: "createRestaurant.logoDataUrl",
  feature: "createRestaurant.featureDataUrl",
  step: "createRestaurant.step",
  restId: "createRestaurant.restId",
  restaurant: "createRestaurant.restaurant",
};

const defaultFields: RestaurantFields = {
  name: "",
  description: "",
  slug: "",
  country_code: "",
  address: "",
  city: "",
  postal_code: "",
  contact_number: "",
  email: "",
  category: "",
  operating_hours: "",
  logo: null,
  feature_image: null,
  geo_coordinate: "",
};

const steps = [
  {
    label: "Restaurant",
    icon: <StorefrontIcon sx={{ fontSize: 20 }} />,
    color: "#6366f1",
  },
  {
    label: "Menu & Items",
    icon: <MenuBookIcon sx={{ fontSize: 20 }} />,
    color: "#f59e0b",
  },
  {
    label: "Review",
    icon: <AssignmentTurnedInIcon sx={{ fontSize: 20 }} />,
    color: "#10b981",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateRestaurantContent() {
  const { authToken } = useAuthProvider();

  const [onProgressSubmit, setOnProgressSubmit] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error";
  }>({ message: "", severity: "info" });

  const [eventFields, setEventFields] =
    useState<RestaurantFields>(defaultFields);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [featureImagePreview, setFeatureImagePreview] = useState<string | null>(
    null
  );
  const [step, setStep] = useState(1);
  const [restId, setRestId] = useState<number | null>(null);
  const [menus, setMenus] = useState<MenuEntry[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [restaurant, setRestaurant] = useState<RestaurantSnapshot | null>(null);

  // ── Toast ──
  const showToast = (
    message: string,
    severity: "success" | "info" | "warning" | "error" = "info"
  ) => {
    setFeedback({ message, severity });
    setToastOpen(true);
  };

  // ── Restore draft on mount ──
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEYS.draft);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as Partial<RestaurantFields>;
        setEventFields((prev) => ({ ...prev, ...parsed }));
      }
      const logo = localStorage.getItem(STORAGE_KEYS.logo);
      if (logo) setLogoPreview(logo);
      const feature = localStorage.getItem(STORAGE_KEYS.feature);
      if (feature) setFeatureImagePreview(feature);
      const savedStep = localStorage.getItem(STORAGE_KEYS.step);
      if (savedStep) setStep(Number(savedStep));
      const rid = localStorage.getItem(STORAGE_KEYS.restId);
      if (rid) setRestId(Number(rid));
      const savedRestaurant = localStorage.getItem(STORAGE_KEYS.restaurant);
      if (savedRestaurant) {
        try {
          setRestaurant(JSON.parse(savedRestaurant));
        } catch {}
      }
    } catch (e) {
      console.warn("Failed to restore draft:", e);
    }
  }, []);

  // ── Persist fields ──
  useEffect(() => {
    try {
      const { logo: _l, feature_image: _f, ...serializable } = eventFields;
      void _l;
      void _f;
      localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(serializable));
    } catch {}
  }, [eventFields]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.step, String(step));
    } catch {}
  }, [step]);

  // ── Currency ──
  const selectedCountryName = useMemo(() => {
    const hit = countryCodes.find(
      (c) => c.code === (eventFields.country_code || "")
    );
    return hit?.name || "Philippines";
  }, [eventFields.country_code]);

  const currencyCode = useMemo(
    () => COUNTRY_CURRENCY[selectedCountryName] || "PHP",
    [selectedCountryName]
  );

  const currencySymbol = useMemo(() => {
    try {
      const nf = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
      });
      return (
        nf.formatToParts(1).find((p) => p.type === "currency")?.value ||
        currencyCode
      );
    } catch {
      return currencyCode || "₱";
    }
  }, [currencyCode]);

  // ── Reset ──
  const clearDraft = () => {
    setEventFields(defaultFields);
    setLogoPreview(null);
    setFeatureImagePreview(null);
    setRestaurant(null);
    setRestId(null);
    setStep(1);
    setMenus([]);
    setSelectedCategories([]);
    setCustomCategories([]);
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch {}
  };

  // ── Field handlers ──
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventFields((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && { slug: generateSlug(value) }),
    }));
  };

  const handleLocationChange = ({
    lat,
    lon,
    address: newAddr,
    city: newCity,
    country: newCountry,
  }: {
    lat: number;
    lon: number;
    address?: string;
    city?: string;
    country?: string;
  }) => {
    setEventFields((prev) => ({
      ...prev,
      geo_coordinate: JSON.stringify({ lat, lng: lon }),
      address: newAddr || prev.address,
      city: newCity || prev.city,
      country_code: (() => {
        if (!newCountry) return prev.country_code;
        const hit = countryCodes.find(
          (c) => c.name.toLowerCase() === String(newCountry).toLowerCase()
        );
        return hit ? hit.code : prev.country_code;
      })(),
    }));
  };

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;
    const file = files[0];
    const opts: CompressOpts =
      name === "feature_image"
        ? {
            maxWidth: 1600,
            maxHeight: 900,
            maxSizeKB: 2000,
            mimeType: "image/jpeg",
            qualityStart: 0.9,
          }
        : {
            maxWidth: 512,
            maxHeight: 512,
            maxSizeKB: 1000,
            mimeType: "image/png",
            qualityStart: 0.92,
          };
    const { dataUrl, outFile } = await compressImage(file, opts);
    setEventFields((prev) => ({ ...prev, [name]: outFile }));
    const previewUrl =
      dataUrl ||
      (await new Promise<string>((res) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result));
        fr.readAsDataURL(outFile);
      }));
    if (name === "logo") {
      setLogoPreview(previewUrl);
      try {
        localStorage.setItem(STORAGE_KEYS.logo, previewUrl);
      } catch {}
    }
    if (name === "feature_image") {
      setFeatureImagePreview(previewUrl);
      try {
        localStorage.setItem(STORAGE_KEYS.feature, previewUrl);
      } catch {}
    }
  };

  const handleRemoveImage = (name: "logo" | "feature_image") => {
    setEventFields((prev) => ({ ...prev, [name]: null }));
    if (name === "logo") {
      setLogoPreview(null);
      try {
        localStorage.removeItem(STORAGE_KEYS.logo);
      } catch {}
    }
    if (name === "feature_image") {
      setFeatureImagePreview(null);
      try {
        localStorage.removeItem(STORAGE_KEYS.feature);
      } catch {}
    }
  };

  // ── Categories ──
  const applySelectedToMenus = (selectedList: string[]) => {
    setSelectedCategories(selectedList);
    setMenus((prev) => {
      const preserved = prev.filter((m) => selectedList.includes(m.name));
      const preservedNames = new Set(preserved.map((m) => m.name));
      const toAdd = selectedList
        .filter((name) => !preservedNames.has(name))
        .map((name) => ({
          menu_id: Date.now() + Math.random(),
          rest_id: restId,
          name,
          recipes: [] as RecipeItem[],
        }));
      return [...preserved, ...toAdd];
    });
  };

  const toggleCategory = (name: string) => {
    const exists = selectedCategories.includes(name);
    const next = exists
      ? selectedCategories.filter((n) => n !== name)
      : [...selectedCategories, name];
    applySelectedToMenus(next);
  };

  const addCustomCategory = () => {
    const name = customName.trim();
    if (!name) return;
    if (![...PRESET_CATEGORIES, ...customCategories].includes(name)) {
      setCustomCategories((prev) => [...prev, name]);
    }
    applySelectedToMenus([...selectedCategories, name]);
    setCustomName("");
    setAddingCustom(false);
  };

  // ── Item editing ──
  const handleAddItem = (menu_id: number) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.menu_id === menu_id
          ? {
              ...m,
              recipes: [
                ...m.recipes,
                {
                  recipe_id: Date.now() + Math.random(),
                  name: "",
                  price: "",
                  description: "",
                  imageFile: null,
                  imagePreview: null,
                  saved: false,
                },
              ],
            }
          : m
      )
    );
  };

  const handleRemoveItem = (menu_id: number, recipe_id: number) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.menu_id === menu_id
          ? {
              ...m,
              recipes: m.recipes.filter((r) => r.recipe_id !== recipe_id),
            }
          : m
      )
    );
  };

  const handleItemChange = (
    menu_id: number,
    recipe_id: number,
    field: keyof RecipeItem,
    value: string
  ) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.menu_id === menu_id
          ? {
              ...m,
              recipes: m.recipes.map((r) =>
                r.recipe_id === recipe_id ? { ...r, [field]: value } : r
              ),
            }
          : m
      )
    );
  };

  const handleItemImageChange = (
    menu_id: number,
    recipe_id: number,
    file: File
  ) => {
    const previewURL = URL.createObjectURL(file);
    setMenus((prev) =>
      prev.map((m) =>
        m.menu_id === menu_id
          ? {
              ...m,
              recipes: m.recipes.map((r) =>
                r.recipe_id === recipe_id
                  ? { ...r, imageFile: file, imagePreview: previewURL }
                  : r
              ),
            }
          : m
      )
    );
  };

  const sanitizePriceInput = (val: string): string => {
    if (val === undefined || val === null) return "";
    let v = String(val)
      .replace(",", ".")
      .replace(/[^0-9.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2)
      v = parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
    const [intPart, decPart] = v.split(".");
    v = intPart || "";
    if (decPart !== undefined) v += "." + decPart.slice(0, 2);
    if (v.startsWith(".")) v = "0" + v;
    return v;
  };

  const handleSaveItem = async (menu_id: number, recipe_id: number) => {
    const menu = menus.find((m) => m.menu_id === menu_id);
    if (!menu) return;
    const item = menu.recipes.find((r) => r.recipe_id === recipe_id);
    if (!item) return;

    const rid = restId;
    if (!rid) {
      showToast("Create restaurant first before saving items.", "warning");
      return;
    }
    if (!item.name || !item.price) {
      showToast("Item name and price are required.", "error");
      return;
    }
    if (!authToken) {
      showToast("Please sign in first.", "warning");
      return;
    }

    setMenus((prev) =>
      prev.map((m) =>
        m.menu_id === menu_id
          ? {
              ...m,
              recipes: m.recipes.map((r) =>
                r.recipe_id === recipe_id ? { ...r, saving: true } : r
              ),
            }
          : m
      )
    );

    try {
      const form = new FormData();
      form.append("category", menu.name);
      form.append("name", item.name);
      form.append("price", String(item.price));
      if (item.description) form.append("description", item.description);
      if (item.imageFile) form.append("avatar", item.imageFile);
      form.append("restaurant_id", String(rid));
      form.append("status", "active");

      const response = await axios.post("/api/profile/create-menu", form, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = response.data as {
        data?: { id?: number };
        id?: number;
      };
      const newId = data?.data?.id ?? data?.id;
      setMenus((prev) =>
        prev.map((m) =>
          m.menu_id === menu_id
            ? {
                ...m,
                recipes: m.recipes.map((r) =>
                  r.recipe_id === recipe_id
                    ? { ...r, saved: true, saving: false, server_id: newId }
                    : r
                ),
              }
            : m
        )
      );
      showToast("Item saved to menu.", "success");
    } catch (err) {
      const errObj = err as {
        response?: { status?: number; data?: unknown };
      };
      const status = errObj?.response?.status;
      let msg = "Failed to save item";
      if (status === 422) {
        const data = errObj.response?.data as {
          errors?: Record<string, string | string[]>;
          message?: string;
        };
        const errors = data?.errors || data?.message || data;
        if (typeof errors === "object" && errors) {
          const list: string[] = [];
          for (const key in errors) {
            const v = (errors as Record<string, string | string[]>)[key];
            const arr = Array.isArray(v) ? v : [String(v)];
            arr.forEach((t) => list.push(`${key}: ${t}`));
          }
          if (list.length) msg = list.join("; ");
        } else if (typeof errors === "string") {
          msg = errors;
        }
      }
      showToast(msg, "error");
      setMenus((prev) =>
        prev.map((m) =>
          m.menu_id === menu_id
            ? {
                ...m,
                recipes: m.recipes.map((r) =>
                  r.recipe_id === recipe_id ? { ...r, saving: false } : r
                ),
              }
            : m
        )
      );
    }
  };

  // ── Submit restaurant ──
  const handleSubmitRestaurant = async () => {
    const requiredFields: (keyof RestaurantFields)[] = [
      "name",
      "address",
      "city",
      "country_code",
      "postal_code",
      "contact_number",
      "email",
      "category",
    ];
    const fieldLabels: Record<string, string> = {
      name: "Restaurant Name",
      address: "Address",
      city: "City",
      country_code: "Country",
      postal_code: "Postal Code",
      contact_number: "Contact Number",
      email: "Email",
      category: "Category",
    };
    for (const field of requiredFields) {
      if (!eventFields[field]) {
        showToast(`"${fieldLabels[field]}" is required!`, "error");
        return;
      }
    }
    if (!eventFields.logo && !logoPreview) {
      showToast(`"Logo" is required!`, "error");
      return;
    }
    if (!eventFields.feature_image && !featureImagePreview) {
      showToast(`"Feature Image" is required!`, "error");
      return;
    }
    if (!authToken) {
      showToast("Please sign in first to create a restaurant.", "warning");
      return;
    }

    setOnProgressSubmit(true);

    try {
      let logoFile = eventFields.logo;
      let coverFile = eventFields.feature_image;
      if (!logoFile && logoPreview)
        logoFile = dataURLToFile(logoPreview, "logo.png");
      if (!coverFile && featureImagePreview)
        coverFile = dataURLToFile(featureImagePreview, "cover.png");

      const form = new FormData();
      form.append("name", eventFields.name);
      form.append("address", eventFields.address || "");
      form.append("description", eventFields.description || "");
      const cc = countryCodes.find((c) => c.code === eventFields.country_code);
      const countryValue = cc ? cc.name : eventFields.country_code || "";
      form.append("country", countryValue);
      form.append("city", eventFields.city || "");
      const postalSan = (eventFields.postal_code || "").toString().trim();
      const mobileSan = (eventFields.contact_number || "")
        .toString()
        .trim()
        .replace(/[^0-9+]/g, "");
      form.append("postal", postalSan);
      form.append("mobile", mobileSan);
      form.append("email", eventFields.email || "");
      form.append("category", eventFields.category || "");
      if (eventFields.geo_coordinate) {
        form.append("geo_coordinate", eventFields.geo_coordinate);
      }
      const sub = toSubdomain(eventFields.slug || eventFields.name);
      form.append("subdomain", sub);
      form.append("sub_domain", sub);
      if (logoFile) form.append("logo", logoFile);
      if (coverFile) form.append("cover", coverFile);

      const response = await axios.post(
        "/api/profile/create-restaurant",
        form,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const respData = response.data as {
        data?: RestaurantSnapshot | RestaurantSnapshot[];
      } & RestaurantSnapshot;
      const pickRestaurant = (payload: unknown): RestaurantSnapshot | null => {
        if (!payload) return null;
        let obj = (payload as { data?: unknown }).data ?? payload;
        if (Array.isArray(obj)) return (obj[0] as RestaurantSnapshot) || null;
        return obj as RestaurantSnapshot;
      };
      const created = pickRestaurant(respData);
      const createdId = created?.id ?? null;
      setRestId(createdId);
      try {
        localStorage.setItem(STORAGE_KEYS.restId, String(createdId || ""));
      } catch {}

      const snap: RestaurantSnapshot = {
        id: createdId,
        name: eventFields.name,
        city: created?.city || eventFields.city,
        country_code: eventFields.country_code,
        category: created?.category || eventFields.category,
        email: created?.email || eventFields.email,
        contact_number: eventFields.contact_number,
        address: created?.address || eventFields.address,
        postal: created?.postal || eventFields.postal_code,
        logo: created?.logo || logoPreview,
        feature_image: created?.feature_image || featureImagePreview,
        created_at: created?.created_at || new Date().toISOString(),
      };
      setRestaurant(snap);
      try {
        localStorage.setItem(STORAGE_KEYS.restaurant, JSON.stringify(snap));
      } catch {}
      try {
        localStorage.removeItem(STORAGE_KEYS.draft);
        localStorage.removeItem(STORAGE_KEYS.logo);
        localStorage.removeItem(STORAGE_KEYS.feature);
      } catch {}

      showToast("Restaurant created! Now build your menu 🎉", "success");
      setStep(2);
    } catch (err) {
      const errObj = err as {
        response?: { status?: number; data?: unknown };
      };
      const status = errObj?.response?.status;
      let msg = "Failed to create restaurant";
      if (status === 422) {
        const data = errObj.response?.data as {
          errors?: Record<string, string | string[]>;
          message?: string;
        };
        const errors = data?.errors || data?.message || data;
        if (typeof errors === "object" && errors) {
          const list: string[] = [];
          for (const key in errors) {
            const v = (errors as Record<string, string | string[]>)[key];
            const arr = Array.isArray(v) ? v : [String(v)];
            arr.forEach((t) => list.push(`${key}: ${t}`));
          }
          if (list.length) msg = list.join("; ");
        } else if (typeof errors === "string") {
          msg = errors;
        }
      }
      showToast(msg, "error");
    } finally {
      setOnProgressSubmit(false);
    }
  };

  const handleSubmitAll = () => {
    showToast("Restaurant workflow complete! 🎉", "success");
    clearDraft();
  };

  const handleStepClick = (index: number) => {
    if (index < step) setStep(index + 1);
    else if (index === 1 && restId) setStep(2);
    else if (index === 2 && menus.length > 0) setStep(3);
    else showToast("Complete previous steps first", "warning");
  };

  const handleNext = () => {
    if (step === 1) handleSubmitRestaurant();
    else if (step === 2) setStep(3);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={feedback.severity}
          variant="filled"
          sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          // Reserve space at the top so the page title clears the
          // position: fixed Step Indicator (sits at top: 64-68 with ~70px
          // of content + a small bottom border).
          pt: { xs: "78px", md: "88px" },
          pb: 6,
          px: { xs: 2, md: 3 },
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {/* Page heading */}
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            color: "#1e293b",
            fontSize: { xs: "1.8rem", md: "2.4rem" },
            mb: 2,
          }}
        >
          Create New Restaurant
        </Typography>

        {/* ── Step Indicator ── */}
        {/*
          Pinned to the viewport directly below the fixed ProfileTopNav.
          We use position: fixed instead of sticky because the page shell
          wraps content in an `overflow: auto` Box which doesn't reliably
          activate sticky for child elements across browsers.

          Left/width mirror the ProfileTopNav so this bar lines up with the
          main content column on lg (16.6667% sidebar = lg=2 of 12 columns).
          The matching spacer below adds vertical room so the bar doesn't
          overlap the page title and form when the page is at the top.
        */}
        <Box
          sx={{
            position: "fixed",
            top: { xs: 64, md: 68 },
            left: { xs: 0, lg: "16.6667%" },
            width: { xs: "100%", lg: "calc(100% - 16.6667%)" },
            zIndex: 1100,
            px: { xs: 1.5, sm: 2.5 },
            py: 1.25,
            mb: 0,
            bgcolor: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #f1f5f9",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {steps.map((s, index) => {
              const isActive = step === index + 1;
              const isCompleted = step > index + 1;
              return (
                <Fragment key={s.label}>
                  <Box
                    onClick={() => handleStepClick(index)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: "50px",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      bgcolor: isActive
                        ? alpha(s.color, 0.1)
                        : isCompleted
                        ? alpha(s.color, 0.07)
                        : "transparent",
                      border: `1.5px solid ${
                        isActive || isCompleted ? s.color : "#e2e8f0"
                      }`,
                      opacity: !isActive && !isCompleted ? 0.5 : 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        bgcolor: isActive || isCompleted ? s.color : "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon sx={{ fontSize: 15 }} />
                      ) : (
                        s.icon
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: isActive
                          ? s.color
                          : isCompleted
                          ? "#334155"
                          : "#94a3b8",
                        display: { xs: "none", sm: "block" },
                      }}
                    >
                      {s.label}
                    </Typography>
                  </Box>
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        flex: 1,
                        height: 2,
                        borderRadius: 2,
                        bgcolor: step > index + 1 ? s.color : "#e2e8f0",
                        transition: "background 0.4s",
                        display: { xs: "none", sm: "block" },
                      }}
                    />
                  )}
                </Fragment>
              );
            })}
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.round(((step - 1) / (steps.length - 1)) * 100)}
            sx={{
              mt: 1.5,
              height: 4,
              borderRadius: 4,
              bgcolor: "#f1f5f9",
              "& .MuiLinearProgress-bar": {
                bgcolor: steps[step - 1]?.color,
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* ══════════════════ STEP 1 ══════════════════ */}
        {step === 1 && (
          <>
            {/* Brand Images */}
            <FormSection>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <SectionTitle
                  icon={<AddPhotoAlternateIcon sx={{ fontSize: 22 }} />}
                  color="#6366f1"
                >
                  Brand Images
                </SectionTitle>
                <Button
                  size="small"
                  onClick={clearDraft}
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    textTransform: "none",
                    color: "#94a3b8",
                    fontSize: "0.82rem",
                    "&:hover": {
                      color: "#6366f1",
                      bgcolor: alpha("#6366f1", 0.06),
                    },
                  }}
                >
                  Start Over
                </Button>
              </Box>
              <FormHelperText
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "#94a3b8",
                  mb: 3,
                }}
              >
                Upload your restaurant logo (square, 512×512) and feature banner
                (16:9, 1600×900+).
              </FormHelperText>
              <Grid container spacing={2.5}>
                {/* Logo */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 600,
                      color: "#64748b",
                      mb: 1,
                    }}
                  >
                    Restaurant Logo *
                  </Typography>
                  <UploadZone
                    hasimage={logoPreview ? 1 : 0}
                    sx={{ height: 200 }}
                  >
                    {logoPreview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreview}
                          alt="Logo"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: 12,
                          }}
                        />
                        <Box
                          className="upload-overlay"
                          sx={{
                            position: "absolute",
                            inset: 0,
                            bgcolor: "rgba(0,0,0,0.45)",
                            borderRadius: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            opacity: 0,
                            transition: "opacity 0.2s",
                          }}
                        >
                          <Box component="label" htmlFor="logo-input">
                            <input
                              id="logo-input"
                              name="logo"
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={handleChangeImage}
                            />
                            <Box
                              sx={{
                                px: 2,
                                py: 1,
                                bgcolor: "rgba(255,255,255,0.2)",
                                borderRadius: 8,
                                color: "#fff",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                backdropFilter: "blur(4px)",
                                cursor: "pointer",
                                fontFamily: "'Outfit', sans-serif",
                              }}
                            >
                              Change
                            </Box>
                          </Box>
                          <Box
                            onClick={() => handleRemoveImage("logo")}
                            sx={{
                              px: 2,
                              py: 1,
                              bgcolor: "rgba(239,68,68,0.7)",
                              borderRadius: 8,
                              color: "#fff",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "'Outfit', sans-serif",
                            }}
                          >
                            Remove
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <Box
                        component="label"
                        htmlFor="logo-input"
                        sx={{
                          cursor: "pointer",
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <input
                          id="logo-input"
                          name="logo"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleChangeImage}
                        />
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            bgcolor: alpha("#6366f1", 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AddPhotoAlternateIcon
                            sx={{ color: "#6366f1", fontSize: 26 }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 600,
                            color: "#6366f1",
                          }}
                        >
                          Upload Logo
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#94a3b8",
                            textAlign: "center",
                            px: 2,
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        >
                          PNG transparent bg preferred
                        </Typography>
                      </Box>
                    )}
                  </UploadZone>
                </Grid>
                {/* Feature Image */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 600,
                      color: "#64748b",
                      mb: 1,
                    }}
                  >
                    Feature / Banner Image *
                  </Typography>
                  <UploadZone
                    hasimage={featureImagePreview ? 1 : 0}
                    sx={{ height: 200 }}
                  >
                    {featureImagePreview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={featureImagePreview}
                          alt="Feature"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 14,
                          }}
                        />
                        <Box
                          className="upload-overlay"
                          sx={{
                            position: "absolute",
                            inset: 0,
                            bgcolor: "rgba(0,0,0,0.45)",
                            borderRadius: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            opacity: 0,
                            transition: "opacity 0.2s",
                          }}
                        >
                          <Box component="label" htmlFor="feature-image-input">
                            <input
                              id="feature-image-input"
                              name="feature_image"
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={handleChangeImage}
                            />
                            <Box
                              sx={{
                                px: 2,
                                py: 1,
                                bgcolor: "rgba(255,255,255,0.2)",
                                borderRadius: 8,
                                color: "#fff",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                backdropFilter: "blur(4px)",
                                cursor: "pointer",
                                fontFamily: "'Outfit', sans-serif",
                              }}
                            >
                              Change
                            </Box>
                          </Box>
                          <Box
                            onClick={() => handleRemoveImage("feature_image")}
                            sx={{
                              px: 2,
                              py: 1,
                              bgcolor: "rgba(239,68,68,0.7)",
                              borderRadius: 8,
                              color: "#fff",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "'Outfit', sans-serif",
                            }}
                          >
                            Remove
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <Box
                        component="label"
                        htmlFor="feature-image-input"
                        sx={{
                          cursor: "pointer",
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <input
                          id="feature-image-input"
                          name="feature_image"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleChangeImage}
                        />
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            bgcolor: alpha("#6366f1", 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PermMediaIcon
                            sx={{ color: "#6366f1", fontSize: 26 }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 600,
                            color: "#6366f1",
                          }}
                        >
                          Upload Banner Image
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#94a3b8",
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        >
                          16:9 recommended · 1600×900+
                        </Typography>
                      </Box>
                    )}
                  </UploadZone>
                </Grid>
              </Grid>
            </FormSection>

            {/* Basic Info */}
            <FormSection>
              <SectionTitle
                icon={<InfoIcon sx={{ fontSize: 22 }} />}
                color="#6366f1"
              >
                Basic Information
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label="Restaurant Name *"
                    name="name"
                    fullWidth
                    value={eventFields.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    select
                    label="Category *"
                    name="category"
                    fullWidth
                    value={eventFields.category}
                    onChange={handleChange}
                    SelectProps={{ MenuProps: { disableScrollLock: true } }}
                  >
                    {RESTAURANT_CATEGORIES.map((cat) => (
                      <MenuItem
                        key={cat}
                        value={cat}
                        sx={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {cat}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label="Contact Number *"
                    name="contact_number"
                    fullWidth
                    value={eventFields.contact_number}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneOutlinedIcon
                            sx={{ color: "#94a3b8", fontSize: 18 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label="Email *"
                    name="email"
                    fullWidth
                    value={eventFields.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon
                            sx={{ color: "#94a3b8", fontSize: 18 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CustomTextField
                    label="Description"
                    name="description"
                    multiline
                    rows={5}
                    fullWidth
                    value={eventFields.description}
                    onChange={handleChange}
                    placeholder="Tell customers what makes your restaurant special..."
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Location */}
            <FormSection>
              <SectionTitle
                icon={<LocationOnOutlinedIcon sx={{ fontSize: 22 }} />}
                color="#f59e0b"
              >
                Location & Address
              </SectionTitle>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    select
                    label="Country *"
                    name="country_code"
                    fullWidth
                    value={eventFields.country_code}
                    onChange={handleChange}
                    SelectProps={{ MenuProps: { disableScrollLock: true } }}
                  >
                    {countryCodes.map((c) => (
                      <MenuItem
                        key={c.code}
                        value={c.code}
                        sx={{
                          fontFamily: "'Outfit', sans-serif",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        {c.name}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                          alt=""
                          width={20}
                          height={14}
                          style={{ borderRadius: 2 }}
                        />
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label="Address *"
                    name="address"
                    fullWidth
                    value={eventFields.address}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label="City *"
                    name="city"
                    fullWidth
                    value={eventFields.city}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label="Postal Code *"
                    name="postal_code"
                    fullWidth
                    value={eventFields.postal_code}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 600,
                      color: "#64748b",
                      mb: 1.5,
                    }}
                  >
                    Map Preview
                  </Typography>
                  <LocationPreview
                    value={eventFields.geo_coordinate}
                    country={selectedCountryName}
                    city={eventFields.city}
                    address={eventFields.address}
                    onChange={handleLocationChange}
                    height={300}
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Nav */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                disabled={onProgressSubmit}
                variant="contained"
                onClick={handleNext}
                size="large"
                startIcon={
                  onProgressSubmit ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : null
                }
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "18px",
                  py: 2,
                  px: 5,
                  fontSize: "1rem",
                  bgcolor: "#6366f1",
                  boxShadow: "0 10px 20px rgba(99,102,241,0.2)",
                  "&:hover": { bgcolor: "#4f46e5" },
                }}
              >
                Continue to Menu
              </Button>
            </Box>
          </>
        )}

        {/* ══════════════════ STEP 2 ══════════════════ */}
        {step === 2 && (
          <>
            <FormSection>
              <SectionTitle
                icon={<MenuBookIcon sx={{ fontSize: 22 }} />}
                color="#f59e0b"
              >
                Menu Categories & Items
              </SectionTitle>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "#64748b",
                  mb: 3,
                }}
              >
                Choose your menu categories and add dishes with photos and
                prices.
              </Typography>

              {/* Category chips */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    color: "#64748b",
                    mb: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontSize: "0.72rem",
                  }}
                >
                  Choose Categories
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ gap: 1 }}
                >
                  {[...PRESET_CATEGORIES, ...customCategories].map((cat) => (
                    <CategoryChip
                      key={cat}
                      label={cat}
                      selected={selectedCategories.includes(cat) ? 1 : 0}
                      variant="outlined"
                      onClick={() => toggleCategory(cat)}
                    />
                  ))}
                  <Chip
                    label={addingCustom ? "✕ Cancel" : "+ Custom"}
                    variant="outlined"
                    onClick={() => {
                      setAddingCustom((v) => !v);
                      setCustomName("");
                    }}
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 600,
                      borderRadius: 10,
                      borderColor: "#cbd5e1",
                      cursor: "pointer",
                      "&:hover": { borderColor: "#334155" },
                    }}
                  />
                </Stack>
                {addingCustom && (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      gap: 1.5,
                      alignItems: "center",
                      maxWidth: 420,
                    }}
                  >
                    <CustomTextField
                      size="small"
                      label="Category name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCustomCategory();
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={addCustomCategory}
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "10px",
                        bgcolor: "#6366f1",
                        "&:hover": { bgcolor: "#4f46e5" },
                        whiteSpace: "nowrap",
                        py: 1.1,
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Per-category item editor */}
              {menus
                .filter((m) => selectedCategories.includes(m.name))
                .map((m) => (
                  <Box key={m.menu_id} sx={{ mb: 5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          height: 2,
                          width: 28,
                          background:
                            "linear-gradient(90deg, #f59e0b, transparent)",
                          borderRadius: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 700,
                          color: "#334155",
                        }}
                      >
                        {m.name}
                      </Typography>
                      <Box
                        sx={{
                          height: 2,
                          flex: 1,
                          bgcolor: "#f1f5f9",
                          borderRadius: 2,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#94a3b8",
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {m.recipes.length} item
                        {m.recipes.length !== 1 ? "s" : ""}
                      </Typography>
                    </Box>
                    <Grid container spacing={2.5}>
                      {m.recipes.map((r) => (
                        <Grid size={{ xs: 12, md: 6 }} key={r.recipe_id}>
                          <Box
                            sx={{
                              background: r.saved
                                ? alpha("#10b981", 0.04)
                                : "#fcfdfe",
                              border: `1.5px solid ${
                                r.saved
                                  ? alpha("#10b981", 0.25)
                                  : "#e2e8f0"
                              }`,
                              borderRadius: "18px",
                              p: 2.5,
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 2 }}>
                              {/* Image uploader */}
                              <Box sx={{ flexShrink: 0, width: 110 }}>
                                <UploadZone
                                  hasimage={r.imagePreview ? 1 : 0}
                                  sx={{ height: 110, borderRadius: "14px" }}
                                >
                                  {r.imagePreview ? (
                                    <>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={r.imagePreview}
                                        alt="item"
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          borderRadius: 12,
                                        }}
                                      />
                                      <Box
                                        className="upload-overlay"
                                        sx={{
                                          position: "absolute",
                                          inset: 0,
                                          bgcolor: "rgba(0,0,0,0.4)",
                                          borderRadius: 12,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          opacity: 0,
                                          transition: "opacity 0.2s",
                                        }}
                                      >
                                        <Box
                                          component="label"
                                          htmlFor={`item-image-${m.menu_id}-${r.recipe_id}`}
                                          sx={{ cursor: "pointer" }}
                                        >
                                          <input
                                            id={`item-image-${m.menu_id}-${r.recipe_id}`}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file)
                                                handleItemImageChange(
                                                  m.menu_id,
                                                  r.recipe_id,
                                                  file
                                                );
                                            }}
                                          />
                                          <Box
                                            sx={{
                                              color: "#fff",
                                              fontSize: "0.72rem",
                                              fontWeight: 600,
                                              fontFamily:
                                                "'Outfit', sans-serif",
                                            }}
                                          >
                                            Change
                                          </Box>
                                        </Box>
                                      </Box>
                                    </>
                                  ) : (
                                    <Box
                                      component="label"
                                      htmlFor={`item-image-${m.menu_id}-${r.recipe_id}`}
                                      sx={{
                                        cursor: "pointer",
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 0.5,
                                      }}
                                    >
                                      <input
                                        id={`item-image-${m.menu_id}-${r.recipe_id}`}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file)
                                            handleItemImageChange(
                                              m.menu_id,
                                              r.recipe_id,
                                              file
                                            );
                                        }}
                                      />
                                      <AddPhotoAlternateIcon
                                        sx={{
                                          color: "#94a3b8",
                                          fontSize: 22,
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "#94a3b8",
                                          fontWeight: 600,
                                          fontSize: "0.68rem",
                                          fontFamily: "'Outfit', sans-serif",
                                        }}
                                      >
                                        Photo
                                      </Typography>
                                    </Box>
                                  )}
                                </UploadZone>
                              </Box>
                              {/* Fields */}
                              <Box
                                sx={{
                                  flex: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1.2,
                                }}
                              >
                                <CustomTextField
                                  size="small"
                                  label="Dish Name *"
                                  value={r.name}
                                  onChange={(e) =>
                                    handleItemChange(
                                      m.menu_id,
                                      r.recipe_id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  fullWidth
                                />
                                <CustomTextField
                                  size="small"
                                  label="Price *"
                                  type="text"
                                  inputMode="decimal"
                                  value={r.price || ""}
                                  fullWidth
                                  placeholder="0.00"
                                  onChange={(e) => {
                                    const v = sanitizePriceInput(
                                      e.target.value
                                    );
                                    handleItemChange(
                                      m.menu_id,
                                      r.recipe_id,
                                      "price",
                                      v
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    if (
                                      ["e", "E", "+", "-"].includes(e.key)
                                    )
                                      e.preventDefault();
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 700,
                                            color: "#64748b",
                                            fontFamily:
                                              "'Outfit', sans-serif",
                                          }}
                                        >
                                          {currencySymbol}
                                        </Typography>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                                <CustomTextField
                                  size="small"
                                  label="Description"
                                  value={r.description || ""}
                                  onChange={(e) =>
                                    handleItemChange(
                                      m.menu_id,
                                      r.recipe_id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  fullWidth
                                  multiline
                                  rows={2}
                                />
                              </Box>
                            </Box>
                            {/* Actions */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 2,
                                pt: 2,
                                borderTop: "1px solid #f1f5f9",
                              }}
                            >
                              <Button
                                size="small"
                                variant="text"
                                onClick={() =>
                                  handleRemoveItem(m.menu_id, r.recipe_id)
                                }
                                sx={{
                                  fontFamily: "'Outfit', sans-serif",
                                  fontSize: "0.78rem",
                                  textTransform: "none",
                                  color: "#ef4444",
                                  "&:hover": {
                                    bgcolor: alpha("#ef4444", 0.06),
                                  },
                                }}
                              >
                                Remove
                              </Button>
                              {r.saved ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    px: 1.5,
                                    py: 0.7,
                                    borderRadius: "10px",
                                    bgcolor: "#10b981",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: "#fff",
                                    fontFamily: "'Outfit', sans-serif",
                                  }}
                                >
                                  <CheckCircleOutlineIcon
                                    sx={{ fontSize: 15 }}
                                  />{" "}
                                  Saved
                                </Box>
                              ) : (
                                <Button
                                  size="small"
                                  variant="contained"
                                  disabled={!!r.saving}
                                  onClick={() =>
                                    handleSaveItem(m.menu_id, r.recipe_id)
                                  }
                                  startIcon={
                                    r.saving ? (
                                      <CircularProgress
                                        size={12}
                                        sx={{ color: "#fff" }}
                                      />
                                    ) : null
                                  }
                                  sx={{
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: "0.78rem",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "10px",
                                    bgcolor: "#6366f1",
                                    boxShadow: "none",
                                    "&:hover": {
                                      bgcolor: "#4f46e5",
                                      boxShadow: "none",
                                    },
                                    py: 0.7,
                                    px: 2,
                                  }}
                                >
                                  Save
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                      {/* Add item */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                          onClick={() => handleAddItem(m.menu_id)}
                          sx={{
                            border: `2px dashed ${alpha("#f59e0b", 0.4)}`,
                            borderRadius: "18px",
                            height: "100%",
                            minHeight: 160,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#f59e0b",
                              bgcolor: alpha("#f59e0b", 0.04),
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              bgcolor: alpha("#f59e0b", 0.12),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <AddIcon sx={{ color: "#f59e0b", fontSize: 24 }} />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Outfit', sans-serif",
                              fontWeight: 700,
                              color: "#f59e0b",
                            }}
                          >
                            Add Item
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ))}

              {selectedCategories.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6, px: 4 }}>
                  <Box sx={{ fontSize: "3rem", mb: 2 }}>🍽️</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 700,
                      color: "#334155",
                      mb: 0.5,
                    }}
                  >
                    Select a category to begin
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      color: "#94a3b8",
                    }}
                  >
                    Choose from the chips above to start adding menu items.
                  </Typography>
                </Box>
              )}
            </FormSection>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                onClick={handlePrev}
                variant="outlined"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "14px",
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                }}
              >
                ← Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={selectedCategories.length === 0}
                size="large"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "18px",
                  py: 2,
                  px: 5,
                  fontSize: "1rem",
                  bgcolor: "#f59e0b",
                  boxShadow: "0 10px 20px rgba(245,158,11,0.2)",
                  "&:hover": { bgcolor: "#d97706" },
                  "&.Mui-disabled": {
                    bgcolor: alpha("#f59e0b", 0.4),
                    color: "#fff",
                  },
                }}
              >
                Review & Submit →
              </Button>
            </Box>
          </>
        )}

        {/* ══════════════════ STEP 3 ══════════════════ */}
        {step === 3 && (
          <>
            <FormSection>
              <SectionTitle
                icon={<AssignmentTurnedInIcon sx={{ fontSize: 22 }} />}
                color="#10b981"
              >
                Review & Submit
              </SectionTitle>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "#64748b",
                  mb: 4,
                }}
              >
                Double-check your details before publishing.
              </Typography>

              {/* Hero */}
              <Box sx={{ position: "relative", mb: 8 }}>
                <Box
                  sx={{
                    height: 220,
                    borderRadius: "20px",
                    overflow: "hidden",
                    bgcolor: "#e2e8f0",
                    backgroundImage: featureImagePreview
                      ? `url(${featureImagePreview})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -42,
                    left: 24,
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    border: "4px solid #fff",
                    bgcolor: "#fff",
                    boxShadow: "0 6px 18px rgba(15,23,42,0.12)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="logo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <StorefrontIcon sx={{ fontSize: 42, color: "#cbd5e1" }} />
                  )}
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {restaurant?.name || eventFields.name || "Your Restaurant"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        color: "#64748b",
                        mt: 0.5,
                      }}
                    >
                      {[eventFields.city, selectedCountryName]
                        .filter(Boolean)
                        .join(", ")}
                    </Typography>
                  </Box>
                  <Stack spacing={1.5}>
                    {[
                      { label: "Category", value: eventFields.category },
                      { label: "Address", value: eventFields.address },
                      { label: "Postal Code", value: eventFields.postal_code },
                      {
                        label: "Contact",
                        value: eventFields.contact_number,
                      },
                      { label: "Email", value: eventFields.email },
                    ].map((row) => (
                      <Box
                        key={row.label}
                        sx={{
                          display: "flex",
                          gap: 2,
                          py: 1.25,
                          borderBottom: "1px dashed #e2e8f0",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 13,
                            color: "#94a3b8",
                            width: 110,
                            flexShrink: 0,
                          }}
                        >
                          {row.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 14,
                            color: "#0f172a",
                            fontWeight: 500,
                          }}
                        >
                          {row.value || "—"}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "18px",
                      bgcolor: alpha("#10b981", 0.06),
                      border: `1px solid ${alpha("#10b981", 0.2)}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#10b981",
                        mb: 1.5,
                      }}
                    >
                      Menu Summary
                    </Typography>
                    {menus.length === 0 ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Outfit', sans-serif",
                          color: "#64748b",
                        }}
                      >
                        No menu categories added yet.
                      </Typography>
                    ) : (
                      <Stack spacing={1.5}>
                        {menus.map((m) => {
                          const savedCount = m.recipes.filter(
                            (r) => r.saved
                          ).length;
                          return (
                            <Box
                              key={m.menu_id}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: "#fff",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "'Outfit', sans-serif",
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  fontSize: 14,
                                }}
                              >
                                {m.name}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: "'Outfit', sans-serif",
                                  fontSize: 12,
                                  color:
                                    savedCount === m.recipes.length &&
                                    m.recipes.length > 0
                                      ? "#10b981"
                                      : "#64748b",
                                  fontWeight: 600,
                                }}
                              >
                                {savedCount}/{m.recipes.length} saved
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </FormSection>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                onClick={handlePrev}
                variant="outlined"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "14px",
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                }}
              >
                ← Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitAll}
                size="large"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "18px",
                  py: 2,
                  px: 5,
                  fontSize: "1rem",
                  bgcolor: "#10b981",
                  boxShadow: "0 10px 20px rgba(16,185,129,0.25)",
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                Finish & Publish 🎉
              </Button>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

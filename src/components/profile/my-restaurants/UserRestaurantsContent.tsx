"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Skeleton,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Link from "next/link";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Restaurant as RestaurantIcon,
} from "@mui/icons-material";
import ReactCountryFlag from "react-country-flag";
import AxiosInstance from "@/lib/AxiosInstance";
import { countryCodes } from "@/lib/countryCodes";
import { useAuthProvider } from "@/providers/AuthProvider";

interface UserRestaurant {
  id?: string | number;
  uuid?: string;
  restaurant_id?: string | number;
  slug?: string;
  name?: string;
  category?: string;
  country?: string;
  cover?: string;
  logo?: string;
  menus?: Array<{ avatar?: string } | null | undefined>;
  user_id?: string | number;
  userId?: string | number;
  owner_id?: string | number;
  user?: { id?: string | number };
  subDomain?: { name?: string };
}

interface RestaurantsApiResponse {
  data?:
    | UserRestaurant[]
    | UserRestaurant
    | { restaurant?: UserRestaurant[] | UserRestaurant };
  restaurant?: UserRestaurant[];
}

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop";

function nameToCode(name?: string): string | null {
  if (!name) return null;
  const entry = countryCodes.find(
    (c) => c.name.toLowerCase() === String(name).toLowerCase()
  );
  return entry ? entry.code : null;
}

function getRestaurantId(r: UserRestaurant): string | number | undefined {
  return r?.id ?? r?.uuid ?? r?.restaurant_id;
}

function getRestaurantViewSlug(r: UserRestaurant): string | undefined {
  return r?.subDomain?.name || r?.slug;
}

export default function UserRestaurantsContent() {
  const { userData, authenticated } = useAuthProvider();
  const [restaurants, setRestaurants] = useState<UserRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<UserRestaurant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info";
  }>({ open: false, msg: "", severity: "info" });

  const showSnack = (msg: string, severity: "success" | "error" | "info") =>
    setSnack({ open: true, msg, severity });

  useEffect(() => {
    let cancelled = false;
    const fetchRestaurants = async () => {
      if (!authenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Some deployments respond at "profile/restaurants/" with trailing slash
        const getOnce = (p: string) =>
          AxiosInstance.get<RestaurantsApiResponse>(p);
        let raw: RestaurantsApiResponse | undefined;
        try {
          ({ data: raw } = await getOnce("profile/restaurants"));
        } catch {
          ({ data: raw } = await getOnce("profile/restaurants/"));
        }

        let arr: UserRestaurant[] = [];
        if (Array.isArray(raw)) arr = raw;
        else if (
          raw?.data &&
          typeof raw.data === "object" &&
          !Array.isArray(raw.data) &&
          "restaurant" in raw.data &&
          Array.isArray((raw.data as { restaurant?: UserRestaurant[] }).restaurant)
        ) {
          arr = (raw.data as { restaurant: UserRestaurant[] }).restaurant;
        } else if (Array.isArray(raw?.data)) {
          arr = raw.data;
        } else if (Array.isArray(raw?.restaurant)) {
          arr = raw.restaurant;
        } else if (raw?.data && !Array.isArray(raw.data)) {
          const block = raw.data as
            | UserRestaurant
            | { restaurant?: UserRestaurant };
          if ("restaurant" in block && block.restaurant) {
            arr = [block.restaurant as UserRestaurant];
          } else {
            arr = [block as UserRestaurant];
          }
        }

        const uid = String(userData?.id ?? "");
        const owned = arr.filter((r) => {
          const ownerCandidates = [
            r?.user_id,
            r?.userId,
            r?.owner_id,
            r?.user?.id,
          ].filter((v) => v != null);
          // If none of the owner fields are present, trust the endpoint
          // (it's "profile/restaurants" — should already be scoped).
          if (ownerCandidates.length === 0) return true;
          return ownerCandidates.some((v) => String(v) === uid);
        });

        if (!cancelled) setRestaurants(owned);
      } catch (e) {
        if (!cancelled) {
          console.warn("Failed to fetch user restaurants", e);
          const msg =
            e instanceof Error ? e.message : "Failed to load restaurants.";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRestaurants();
    return () => {
      cancelled = true;
    };
  }, [authenticated, userData?.id]);

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    const restId = getRestaurantId(confirmTarget);
    if (restId == null) {
      showSnack("This restaurant has no id — cannot delete.", "error");
      setConfirmTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await AxiosInstance.delete(`profile/restaurants/${restId}`);
      setRestaurants((prev) =>
        prev.filter((x) => getRestaurantId(x) !== restId)
      );
      showSnack("Restaurant deleted.", "success");
      setConfirmTarget(null);
    } catch (e) {
      console.error("Delete failed", e);
      showSnack("Failed to delete restaurant.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, fontFamily: "'Outfit', sans-serif" }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-end" }}
        spacing={2}
        sx={{ mb: 5 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "-0.02em",
              color: "#1a1a1a",
              fontSize: { xs: "1.6rem", md: "2.2rem" },
            }}
          >
            Your Restaurants
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              mt: 0.5,
              fontSize: "1.05rem",
            }}
          >
            {loading
              ? "Loading your restaurants…"
              : error
              ? "Unable to load restaurants."
              : restaurants.length === 0
              ? "Add your first restaurant to get started."
              : `${restaurants.length} ${
                  restaurants.length === 1 ? "restaurant" : "restaurants"
                } in your portfolio.`}
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/profile/create-restaurant"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            px: 4,
            py: 1.2,
            fontSize: "1rem",
          }}
        >
          Add Restaurant
        </Button>
      </Stack>

      {error ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid #fee2e2",
            bgcolor: "#fef2f2",
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#991b1b", fontWeight: 700 }}>
            Failed to load restaurants
          </Typography>
          <Typography sx={{ color: "#7f1d1d", fontSize: 14, mt: 0.5 }}>
            {error}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {loading &&
            Array.from(new Array(6)).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`skeleton-${i}`}>
                <Skeleton
                  variant="rounded"
                  height={350}
                  sx={{ borderRadius: 4 }}
                />
              </Grid>
            ))}

          {!loading && restaurants.length === 0 && (
            <Grid size={12}>
              <Paper
                sx={{
                  py: 12,
                  textAlign: "center",
                  borderRadius: 4,
                  border: "2px dashed #e0e0e0",
                  bgcolor: "transparent",
                  boxShadow: "none",
                }}
              >
                <RestaurantIcon
                  sx={{ fontSize: 60, color: "#bdbdbd", mb: 2 }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  No restaurants listed yet.
                </Typography>
                <Button
                  component={Link}
                  href="/profile/create-restaurant"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    mt: 3,
                    textTransform: "none",
                    borderRadius: "10px",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    px: 4,
                    py: 1.2,
                  }}
                >
                  Add your first restaurant
                </Button>
              </Paper>
            </Grid>
          )}

          {!loading &&
            restaurants.map((r) => {
              const code = nameToCode(r.country);
              const restId = getRestaurantId(r);
              const viewSlug = getRestaurantViewSlug(r);

              const heroSrc =
                r.cover ||
                r.logo ||
                r.menus?.find((m) => m?.avatar)?.avatar ||
                FALLBACK_HERO;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={String(restId)}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 5,
                      border: "1px solid #eee",
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                      width: "100%",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 15px 30px rgba(0,0,0,0.06)",
                      },
                    }}
                  >
                    {/* HERO BANNER */}
                    <Box
                      sx={{
                        height: 160,
                        width: "100%",
                        backgroundImage: `url(${heroSrc})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        bgcolor: "#fafafa",
                      }}
                    />

                    <Box
                      sx={{
                        px: 3,
                        mt: -6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                      }}
                    >
                      <Box sx={{ position: "relative" }}>
                        <Avatar
                          src={r.logo}
                          sx={{
                            width: 85,
                            height: 85,
                            border: "5px solid #fff",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            bgcolor: "#f9f9f9",
                          }}
                        />
                        {code && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              overflow: "hidden",
                              border: "2px solid #fff",
                            }}
                          >
                            <ReactCountryFlag
                              countryCode={code}
                              svg
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
                        <Tooltip
                          title={
                            <Typography
                              sx={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: "0.8rem",
                              }}
                            >
                              Edit
                            </Typography>
                          }
                        >
                          <span>
                            <IconButton
                              component={Link}
                              href={`/profile/my-restaurants/${restId ?? ""}/edit`}
                              disabled={restId == null}
                              sx={{
                                bgcolor: "#fff",
                                border: "1px solid #eee",
                                p: 1.2,
                                "&:hover": { bgcolor: "#f0f7ff" },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 24, color: "#1976d2" }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            <Typography
                              sx={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: "0.8rem",
                              }}
                            >
                              Delete
                            </Typography>
                          }
                        >
                          <IconButton
                            onClick={() => setConfirmTarget(r)}
                            sx={{
                              bgcolor: "#fff",
                              border: "1px solid #eee",
                              p: 1.2,
                              color: "#d32f2f",
                              "&:hover": { bgcolor: "#fff1f1" },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 24 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    <Box sx={{ p: 3, pt: 2 }}>
                      <Typography
                        sx={{
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 500,
                          fontSize: "1.35rem",
                          color: "#222",
                          mb: 0.5,
                        }}
                      >
                        {r.name || "Unnamed Restaurant"}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Outfit', sans-serif",
                          color: "text.secondary",
                          fontSize: "1rem",
                          display: "block",
                          mb: 2.5,
                        }}
                      >
                        {r.category || "Dining Establishment"}
                      </Typography>

                      <Divider sx={{ mb: 2.5 }} />

                      <Button
                        component={Link}
                        href={viewSlug ? `/${viewSlug}` : "#"}
                        disabled={!viewSlug}
                        fullWidth
                        variant="outlined"
                        sx={{
                          borderRadius: "10px",
                          textTransform: "none",
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          py: 1,
                          color: "#444",
                          borderColor: "#ccc",
                          "&:hover": {
                            borderColor: "#1976d2",
                            color: "#1976d2",
                            bgcolor: "#f0f7ff",
                          },
                        }}
                      >
                        View Restaurant
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
        </Grid>
      )}

      {/* DELETE CONFIRMATION */}
      <Dialog
        open={Boolean(confirmTarget)}
        onClose={() => !deleting && setConfirmTarget(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}
        >
          Delete this restaurant?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{confirmTarget?.name || "This restaurant"}</strong> will be
            permanently removed. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmTarget(null)}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleting}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
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
    </Container>
  );
}

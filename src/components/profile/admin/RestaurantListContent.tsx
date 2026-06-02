"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import LinkRounded from "@mui/icons-material/LinkRounded";
import SearchIcon from "@mui/icons-material/Search";
import ReactCountryFlag from "react-country-flag";
import AxiosInstance from "@/lib/AxiosInstance";
import { countryCodes } from "@/lib/countryCodes";

interface RawRestaurant {
  id?: string | number;
  user_id?: string | number;
  userId?: string | number;
  uuid?: string;
  name?: string;
  full_name?: string;
  email?: string;
  country?: string;
  photo?: string;
  avatar?: string;
  cover?: string;
  logo?: string;
  subdomain?: string;
  subDomain?: { name?: string };
  user?: { name?: string; email?: string };
  details?: {
    photo?: string;
    logo?: string;
    country?: string;
    sub_domain?: string;
    country_details?: { code?: string; name?: string };
  };
}

interface RestaurantsApiResponse {
  data?:
    | {
        users?: RawRestaurant[];
        data?: RawRestaurant[];
        restaurant?: RawRestaurant[];
        restaurants?: RawRestaurant[];
      }
    | RawRestaurant[];
  restaurants?: RawRestaurant[];
}

interface RestaurantRow {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  countryName: string;
  subdomain: string;
  photo: string;
}

function nameToCode(name: string): string {
  if (!name) return "";
  const lower = String(name).toLowerCase();
  const entry = countryCodes.find((c) => c.name.toLowerCase() === lower);
  if (entry) return entry.code.toUpperCase();
  const partial = countryCodes.find((c) =>
    lower.includes(c.name.toLowerCase())
  );
  return partial ? partial.code.toUpperCase() : "";
}

function extractCountryCode(restaurant: RawRestaurant): string {
  // API sample shows: details.country_details.code
  const fromNestedCode = restaurant?.details?.country_details?.code;
  const fromNestedName = restaurant?.details?.country_details?.name;
  if (fromNestedCode) return String(fromNestedCode).toUpperCase();
  if (fromNestedName) return nameToCode(fromNestedName);

  const countryNameField =
    restaurant?.country || restaurant?.details?.country || "";
  if (countryNameField) return nameToCode(countryNameField);

  return "";
}

function extractCountryName(restaurant: RawRestaurant): string {
  return (
    restaurant?.details?.country_details?.name ||
    restaurant?.details?.country ||
    restaurant?.country ||
    ""
  );
}

function extractSubdomain(restaurant: RawRestaurant): string {
  return (
    restaurant?.subDomain?.name ||
    restaurant?.details?.sub_domain ||
    restaurant?.subdomain ||
    ""
  );
}

function extractPhoto(restaurant: RawRestaurant): string {
  const src =
    restaurant?.logo ||
    restaurant?.details?.logo ||
    restaurant?.details?.photo ||
    restaurant?.photo ||
    restaurant?.avatar ||
    restaurant?.cover ||
    "";
  return typeof src === "string" ? src.trim() : "";
}

function extractName(restaurant: RawRestaurant): string {
  return (
    restaurant?.name || restaurant?.full_name || restaurant?.user?.name || "—"
  );
}

function extractEmail(restaurant: RawRestaurant): string {
  return restaurant?.email || restaurant?.user?.email || "";
}

function extractId(restaurant: RawRestaurant): string | number {
  return (
    restaurant?.id ||
    restaurant?.user_id ||
    restaurant?.userId ||
    restaurant?.uuid ||
    extractEmail(restaurant) ||
    extractName(restaurant)
  );
}

export default function RestaurantListContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<RestaurantRow[]>([]);
  const [countryFilter, setCountryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    let cancelled = false;
    const fetchRestaurants = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await AxiosInstance.get<RestaurantsApiResponse>(
          "restaurants"
        );
        const payload = res?.data ?? {};
        const container = (payload?.data ?? payload) as unknown as
          | {
              users?: RawRestaurant[];
              data?: RawRestaurant[];
              restaurant?: RawRestaurant[];
              restaurants?: RawRestaurant[];
            }
          | RawRestaurant[]
          | undefined;

        // Handle every response shape seen from this endpoint:
        // - { data: { users: [...] } }
        // - { data: [...] }
        // - { data: { data: [...] } }
        // - { data: { restaurants: [...] } }
        // - { data: { restaurant: [...] } }
        // - { restaurants: [...] }
        let list: RawRestaurant[] = [];
        if (Array.isArray((container as { users?: unknown })?.users)) {
          list = (container as { users: RawRestaurant[] }).users;
        } else if (Array.isArray(container)) {
          list = container;
        } else if (Array.isArray((container as { data?: unknown })?.data)) {
          list = (container as { data: RawRestaurant[] }).data;
        } else if (
          Array.isArray((container as { restaurants?: unknown })?.restaurants)
        ) {
          list = (container as { restaurants: RawRestaurant[] }).restaurants;
        } else if (
          Array.isArray((container as { restaurant?: unknown })?.restaurant)
        ) {
          list = (container as { restaurant: RawRestaurant[] }).restaurant;
        } else if (Array.isArray(payload?.restaurants)) {
          list = payload.restaurants;
        }

        const normalized: RestaurantRow[] = list.map((restaurant, idx) => ({
          id: String(extractId(restaurant) ?? idx),
          name: extractName(restaurant),
          email: extractEmail(restaurant),
          countryCode: extractCountryCode(restaurant),
          countryName: extractCountryName(restaurant),
          subdomain: extractSubdomain(restaurant),
          photo: extractPhoto(restaurant),
        }));

        if (!cancelled) setRows(normalized);
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to fetch restaurants", e);
          setError("Failed to fetch restaurants list.");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRestaurants();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sort by name asc by default (matches Vite initial sort)
  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.name.localeCompare(b.name)),
    [rows]
  );

  const availableCountries = useMemo(() => {
    const set = new Set(rows.map((r) => r.countryCode).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sorted.filter((r) => {
      if (countryFilter !== "all" && r.countryCode !== countryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.countryName.toLowerCase().includes(q) ||
        r.subdomain.toLowerCase().includes(q)
      );
    });
  }, [sorted, countryFilter, search]);

  const pagedRows = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  // Reset to first page at the call site rather than via an effect.
  const handleCountryChange = (value: string) => {
    setCountryFilter(value);
    setPage(0);
  };
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };
  const handleClearFilters = () => {
    setCountryFilter("all");
    setSearch("");
    setPage(0);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        pb: { xs: 12, lg: 5 },
        minHeight: "100vh",
      }}
    >
      {/* Page header with orange gradient */}
      <Box
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #FF9500 0%, #FF6B35 100%)",
          borderRadius: 3,
          p: 3,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(255, 107, 53, 0.2)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "200px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            transform: "translate(50%, -50%)",
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            mb: 1,
            fontFamily: "'Outfit', sans-serif",
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
            position: "relative",
            zIndex: 1,
          }}
        >
          🍽️ Restaurant List
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: "1rem",
            color: "rgba(255, 255, 255, 0.95)",
            lineHeight: 1.6,
            fontWeight: 500,
            position: "relative",
            zIndex: 1,
            letterSpacing: "0.3px",
          }}
        >
          Discover delicious restaurants and culinary experiences! 🌟 Explore
          their menus, check out their venues, and find your next favorite
          dining destination. Click the website link to explore more!
        </Typography>
      </Box>

      {/* Filters card */}
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
            <FormControl
              size="small"
              sx={{ minWidth: 240, flex: { sm: "0 0 auto" } }}
            >
              <InputLabel
                id="country-filter-label"
                sx={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Filter by Country
              </InputLabel>
              <Select
                labelId="country-filter-label"
                label="Filter by Country"
                value={countryFilter}
                onChange={(e: SelectChangeEvent) =>
                  handleCountryChange(e.target.value)
                }
                MenuProps={{
                  disableScrollLock: true,
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      mt: 1,
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    },
                  },
                }}
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f9fafb",
                  },
                }}
              >
                <MenuItem
                  value="all"
                  sx={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.95rem",
                    }}
                  >
                    All Countries
                  </Typography>
                </MenuItem>
                {availableCountries.map((c) => (
                  <MenuItem
                    key={c}
                    value={c}
                    sx={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ReactCountryFlag
                        countryCode={c}
                        svg
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 2,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {c} -{" "}
                        {rows.find((r) => r.countryCode === c)?.countryName ||
                          ""}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search name, email, country, or subdomain…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f9fafb",
                  fontFamily: "'Outfit', sans-serif",
                },
              }}
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
              onClick={handleClearFilters}
              sx={{
                textTransform: "none",
                fontFamily: "'Outfit', sans-serif",
                color: "#6b7280",
                borderColor: "#d1d5db",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              Clear Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            fontFamily: "'Outfit', sans-serif",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Typography
          variant="body2"
          sx={{
            mb: 1.5,
            color: "#6b7280",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {filtered.length === rows.length
            ? `${rows.length} ${
                rows.length === 1 ? "restaurant" : "restaurants"
              }`
            : `Showing ${filtered.length} of ${rows.length} restaurants`}
        </Typography>
      )}

      {/* Table card */}
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
                <TableCell
                  sx={{
                    backgroundColor: "#f9fafb",
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Restaurant
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#f9fafb",
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#f9fafb",
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Country
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#f9fafb",
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Website
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
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
                        sx={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        Loading restaurants…
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography
                      color="text.secondary"
                      sx={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {rows.length === 0
                        ? "No restaurants found."
                        : "No restaurants match the current filters."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      backgroundColor: idx % 2 === 0 ? "#fff" : "#fafbfc",
                      "&:hover": { backgroundColor: "#f9fafb" },
                    }}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Avatar
                          src={row.photo || undefined}
                          alt={row.name}
                          sx={{
                            width: 42,
                            height: 42,
                            backgroundColor: "#10b981",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            border: "2px solid #e5e7eb",
                            flexShrink: 0,
                            "& img": { objectFit: "cover" },
                          }}
                        >
                          {row.name?.charAt(0)?.toUpperCase() || "?"}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#1f2937",
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        >
                          {row.name || "—"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 1.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#6b7280",
                          fontSize: "0.9rem",
                          fontFamily: "'Outfit', sans-serif",
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={row.email}
                      >
                        {row.email || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.5 }}>
                      {row.countryCode ? (
                        <Chip
                          icon={
                            <Box
                              sx={{
                                ml: -0.5,
                                mr: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ReactCountryFlag
                                countryCode={row.countryCode}
                                svg
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 2,
                                }}
                              />
                            </Box>
                          }
                          label={`${row.countryCode}${
                            row.countryName ? ` - ${row.countryName}` : ""
                          }`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            color: "#10b981",
                            borderColor: "rgba(16, 185, 129, 0.3)",
                            backgroundColor: "rgba(16, 185, 129, 0.05)",
                            fontSize: "0.85rem",
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ py: 1.5 }}>
                      {row.subdomain ? (
                        <Box
                          component="a"
                          href={`https://${row.subdomain}.bayanihan.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            color: "#3b82f6",
                            textDecoration: "none",
                            fontWeight: 500,
                            fontSize: "0.9rem",
                            fontFamily: "'Outfit', sans-serif",
                            maxWidth: 240,
                            "&:hover": {
                              textDecoration: "underline",
                              color: "#2563eb",
                            },
                          }}
                        >
                          <LinkRounded sx={{ fontSize: 18, flexShrink: 0 }} />
                          <span
                            title={row.subdomain}
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.subdomain}
                          </span>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
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
            sx={{
              borderTop: "1px solid #e5e7eb",
              "& .MuiTablePagination-root": {
                fontFamily: "'Outfit', sans-serif",
                color: "#6b7280",
              },
            }}
          />
        )}
      </Card>
    </Box>
  );
}

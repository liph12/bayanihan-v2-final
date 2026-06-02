"use client";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Box,
  TextField,
  Typography,
  Autocomplete,
  FormHelperText,
  ButtonGroup,
  Button,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import AxiosInstance from "@/lib/AxiosInstance";
import { countryCodes } from "@/lib/countryCodes";
import { useAuthProvider } from "@/providers/AuthProvider";
import type { UserData } from "@/types";

const LOGO_URL =
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/filipinohomes-new/uploader/6c9de737-462e-41d1-b4b8-5552c02ed9aa.webp";

type Role = "event_organizer" | "restaurant_owner";

interface Credentials {
  name: string;
  email: string;
  password: string;
  repeatPassword: string;
  role: Role;
}

interface UserLocation {
  country: string;
  state: string;
}

interface RegisterResponse {
  authToken?: string;
  user?: UserData;
}

const COUNTRY_OPTIONS = countryCodes.map((c, idx) => ({
  id: idx,
  label: c.name,
  code: c.code,
}));

const pillFieldSx = {
  my: 1,
  "& .MuiInput-root": {
    "&:before, :after, :hover:not(.Mui-disabled):before": { borderBottom: 0 },
  },
  "& .MuiInputBase-input": {
    background: "#fff",
    borderRadius: "50px",
    textIndent: "30px",
    px: "30px",
    pb: "10px",
  },
};

const acFieldSx = {
  "& .MuiInputBase-root": {
    background: "#fff",
    borderRadius: "50px",
    textIndent: "30px",
    px: "30px",
    pb: "5px",
  },
  my: 1,
};

export default function RegistrationForm() {
  const router = useRouter();
  const { login, authenticated, ready } = useAuthProvider();

  useEffect(() => {
    if (ready && authenticated) router.replace("/profile");
  }, [ready, authenticated, router]);

  const [credentials, setCredentials] = useState<Credentials>({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
    role: "event_organizer",
  });
  const [userLocation, setUserLocation] = useState<UserLocation>({
    country: "",
    state: "",
  });
  const [onProgress, setOnProgress] = useState(false);
  const [isRequestFail, setIsRequestFail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((p) => ({ ...p, [name]: value }));
  };

  const toggleRole = (role: Role) =>
    setCredentials((p) => ({ ...p, role }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const { password, repeatPassword, name, email } = credentials;
    const { country } = userLocation;
    if (!password || !repeatPassword || !email || !name || !country) {
      setError("Please fill up empty fields.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords don't match.");
      return;
    }

    setOnProgress(true);
    setIsRequestFail(false);
    try {
      const resp = await AxiosInstance.post<RegisterResponse[]>(
        "auth/users",
        JSON.stringify({ ...credentials, ...userLocation }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (resp.status === 200 && resp.data?.[0]) {
        const { authToken, user } = resp.data[0];
        if (authToken && user) {
          login(authToken, user);
          setTimeout(() => router.push("/profile"), 800);
          return;
        }
      }
      setError("Registration failed. Please try again.");
    } catch (err) {
      const status =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response?.status ===
          "number"
          ? (err as { response: { status: number } }).response.status
          : undefined;
      if (status === 403) {
        setError("Email is already taken.");
        setIsRequestFail(true);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setOnProgress(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        m: { xs: 2.5, md: "10px", lg: "40px 20px" },
        textAlign: "center",
      }}
    >
      <Typography
        component="div"
        variant="h6"
        sx={{
          fontFamily: "var(--font-urbanist)",
          fontWeight: 700,
          color: "#fff",
          textTransform: "uppercase",
        }}
      >
        Welcome To
      </Typography>
      <Box
        component={NextLink}
        href="/"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ml: { xs: "25px", lg: 0 },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="Bayanihan Logo" style={{ maxHeight: 55 }} />
      </Box>
      <Typography
        component="div"
        variant="h6"
        sx={{ color: "#fff", fontFamily: "var(--font-urbanist)" }}
      >
        Register here
      </Typography>
      <ButtonGroup color="info" sx={{ my: 1 }}>
        <Button
          sx={{ borderRadius: 5, textTransform: { lg: "uppercase", xs: "none" } }}
          onClick={() => toggleRole("event_organizer")}
          variant={
            credentials.role === "event_organizer" ? "contained" : "outlined"
          }
        >
          Event Organizer
        </Button>
        <Button
          sx={{ borderRadius: 5, textTransform: { lg: "uppercase", xs: "none" } }}
          onClick={() => toggleRole("restaurant_owner")}
          variant={
            credentials.role === "restaurant_owner" ? "contained" : "outlined"
          }
        >
          Restaurant Owner
        </Button>
      </ButtonGroup>
      <Autocomplete
        options={COUNTRY_OPTIONS}
        value={
          COUNTRY_OPTIONS.find((c) => c.label === userLocation.country) || null
        }
        renderOption={(props, option) => {
          const { key, ...other } = props as React.LiHTMLAttributes<HTMLLIElement> & {
            key?: string;
          };
          return (
            <Box
              key={option.id}
              component="li"
              sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
              {...other}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                loading="lazy"
                width="20"
                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                alt=""
              />
              {option.label}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            name="country"
            label="Country"
            variant="standard"
            slotProps={{
              input: { ...params.InputProps, disableUnderline: true },
            }}
          />
        )}
        sx={acFieldSx}
        onChange={(_e, v) =>
          setUserLocation((p) => ({ ...p, country: v?.label || "" }))
        }
        isOptionEqualToValue={(option, value) => option.id === value?.id}
      />
      <TextField
        // State/Province kept as free-text — porting the full states dataset
        // (1700+ lines in countries.js) is its own task. TODO.
        variant="standard"
        label="State / Province"
        name="state"
        fullWidth
        sx={pillFieldSx}
        value={userLocation.state}
        onChange={(e) =>
          setUserLocation((p) => ({ ...p, state: e.target.value }))
        }
        slotProps={{ input: { disableUnderline: true } }}
      />
      <TextField
        variant="standard"
        label="Full Name"
        name="name"
        fullWidth
        sx={pillFieldSx}
        value={credentials.name}
        onChange={onChange}
        slotProps={{ input: { disableUnderline: true } }}
      />
      <TextField
        variant="standard"
        label="Email address"
        name="email"
        type="email"
        fullWidth
        sx={pillFieldSx}
        value={credentials.email}
        onChange={onChange}
        slotProps={{ input: { disableUnderline: true } }}
      />
      <TextField
        type="password"
        variant="standard"
        label="Password"
        name="password"
        fullWidth
        sx={pillFieldSx}
        value={credentials.password}
        onChange={onChange}
        slotProps={{ input: { disableUnderline: true } }}
      />
      <TextField
        type="password"
        variant="standard"
        label="Confirm Password"
        name="repeatPassword"
        fullWidth
        sx={pillFieldSx}
        value={credentials.repeatPassword}
        onChange={onChange}
        slotProps={{ input: { disableUnderline: true } }}
      />
      {error && (
        <FormHelperText sx={{ fontSize: 14, color: "error.main" }}>
          {isRequestFail ? "Email address is already taken." : error}
        </FormHelperText>
      )}
      <Button
        type="submit"
        loading={onProgress}
        variant="contained"
        fullWidth
        disableElevation
        sx={{
          background: "#0977B2",
          borderRadius: "50px",
          my: 1.25,
          py: "13px",
          px: "10px",
          fontFamily: "var(--font-urbanist)",
        }}
      >
        Submit
      </Button>
      <Typography
        component="div"
        sx={{ color: "#fff", fontFamily: "var(--font-outfit)" }}
      >
        Already registered?{" "}
        <Box
          component={NextLink}
          href="/sign-in"
          sx={{ color: "#FF0000", textDecoration: "none" }}
        >
          Sign in here
        </Box>
      </Typography>
    </Box>
  );
}

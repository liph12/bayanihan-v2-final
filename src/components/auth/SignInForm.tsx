"use client";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Box,
  TextField,
  Typography,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import AxiosInstance from "@/lib/AxiosInstance";
import { useAuthProvider } from "@/providers/AuthProvider";
import type { UserData } from "@/types";

const LOGO_URL =
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/filipinohomes-new/uploader/6c9de737-462e-41d1-b4b8-5552c02ed9aa.webp";

interface Credentials {
  email: string;
  password: string;
}

interface SignInResponse {
  authToken?: string;
  user?: UserData;
}

const inputSx = {
  "& .MuiInput-root": {
    "&:before, :after, :hover:not(.Mui-disabled):before": { borderBottom: 0 },
  },
  my: 1,
  background: "#9C9C9C",
  borderRadius: "50px",
  textIndent: "30px",
  px: "30px",
  pb: "5px",
};

const pillBtnSx = {
  borderRadius: "50px",
  py: "10px",
  px: "20px",
};

export default function SignInForm() {
  const router = useRouter();
  const { login, authenticated, ready } = useAuthProvider();

  // Already signed in? Bounce to profile.
  useEffect(() => {
    if (ready && authenticated) router.replace("/profile");
  }, [ready, authenticated, router]);

  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [onProgress, setOnProgress] = useState(false);
  const [isRequestFail, setIsRequestFail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [onVerifyProgress, setOnVerifyProgress] = useState(false);
  const [onErrorEmail, setOnErrorEmail] = useState(false);
  const [onErrorVerificationCode, setOnErrorVerificationCode] =
    useState(false);
  const [onErrorPassword, setOnErrorPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async (email: string) => {
    setGoogleLoading(true);
    setIsRequestFail(false);
    try {
      const resp = await AxiosInstance.post<SignInResponse[]>(
        "sign-in-attempt",
        JSON.stringify({ googleAuth: true, email }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (resp.status === 200 && resp.data?.[0]) {
        const { authToken, user } = resp.data[0];
        if (authToken && user) {
          login(authToken, user);
          router.push("/profile");
          return;
        }
      }
      setIsRequestFail(true);
    } catch (err) {
      const status =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response?.status ===
          "number"
          ? (err as { response: { status: number } }).response.status
          : undefined;
      if (status === 403) setIsRequestFail(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        const userInfo = await axios.get<{ email?: string }>(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const email = userInfo.data?.email;
        if (email) await handleGoogleSignIn(email);
        else setIsRequestFail(true);
      } catch {
        setIsRequestFail(true);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      setIsRequestFail(true);
    },
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("[SignIn] submit", credentials);
    setOnProgress(true);
    setIsRequestFail(false);
    setErrorMessage(null);

    if (!credentials.email || !credentials.password) {
      setErrorMessage("Please enter email and password.");
      setOnProgress(false);
      return;
    }

    try {
      const resp = await axios.post<SignInResponse[]>(
        "/api/auth/sign-in",
        credentials,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("[SignIn] response", resp.status, resp.data);
      if (resp.status === 200 && resp.data?.[0]) {
        const { authToken, user } = resp.data[0];
        if (authToken && user) {
          login(authToken, user);
          router.push("/profile");
          return;
        }
      }
      setIsRequestFail(true);
    } catch (err) {
      console.error("[SignIn] error", err);
      const e = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      const status = e?.response?.status;
      const body = e?.response?.data;
      console.error("[SignIn] response body:", body);
      const serverMsg =
        body && typeof body === "object" && "message" in body
          ? String((body as { message?: unknown }).message)
          : undefined;

      if (status === 403) {
        setIsRequestFail(true);
      } else if (status) {
        setErrorMessage(
          serverMsg
            ? `Login failed (status ${status}): ${serverMsg}`
            : `Login failed (status ${status}).`
        );
      } else {
        setErrorMessage(e?.message || "Network error reaching the server.");
      }
    } finally {
      setOnProgress(false);
    }
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setEmailSent(false);
    setPasswordReset(false);
    setEmailForReset("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setOnErrorEmail(false);
    setOnErrorVerificationCode(false);
    setOnErrorPassword(false);
  };

  const submitVerifyEmail = async () => {
    setOnErrorEmail(false);
    setOnVerifyProgress(true);
    try {
      const resp = await AxiosInstance.post(
        "verify-email",
        JSON.stringify({ email: emailForReset }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (resp.status === 200) setEmailSent(true);
    } catch (err) {
      const status =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response?.status ===
          "number"
          ? (err as { response: { status: number } }).response.status
          : undefined;
      if (status === 403) setOnErrorEmail(true);
    } finally {
      setOnVerifyProgress(false);
    }
  };

  const submitVerificationCode = async () => {
    setOnErrorVerificationCode(false);
    setOnVerifyProgress(true);
    try {
      const resp = await AxiosInstance.post(
        "submit-verification-code",
        JSON.stringify({ email: emailForReset, code: verificationCode }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (resp.status === 200) setPasswordReset(true);
    } catch (err) {
      const status =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response?.status ===
          "number"
          ? (err as { response: { status: number } }).response.status
          : undefined;
      if (status === 403) setOnErrorVerificationCode(true);
    } finally {
      setOnVerifyProgress(false);
    }
  };

  const submitNewPassword = async () => {
    setOnErrorPassword(false);
    if (newPassword !== confirmPassword) {
      setOnErrorPassword(true);
      return;
    }
    setOnVerifyProgress(true);
    try {
      const resp = await AxiosInstance.post<SignInResponse[]>(
        "update-new-password",
        JSON.stringify({
          email: emailForReset,
          password: newPassword,
          code: verificationCode,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (resp.status === 200 && resp.data?.[0]) {
        const { authToken, user } = resp.data[0];
        if (authToken && user) {
          login(authToken, user);
          setTimeout(() => router.push("/profile"), 1200);
        }
      }
    } catch {
      // swallow — surfaced via toast in original; we just stop the spinner
    } finally {
      setOnVerifyProgress(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 2.5, md: "10px", lg: "30px 25px" },
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
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", ml: { xs: "25px", lg: 0 } }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="Bayanihan Logo" style={{ maxHeight: 55 }} />
      </Box>
      <TextField
        variant="standard"
        label="Email address"
        fullWidth
        sx={inputSx}
        name="email"
        type="email"
        value={credentials.email}
        onChange={onChange}
      />
      <TextField
        type={showPassword ? "text" : "password"}
        variant="standard"
        label="Password"
        name="password"
        fullWidth
        sx={inputSx}
        value={credentials.password}
        onChange={onChange}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((p) => !p)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      {isRequestFail && (
        <FormHelperText sx={{ fontSize: 14, color: "error.main" }}>
          Invalid email/password.
        </FormHelperText>
      )}
      {errorMessage && (
        <FormHelperText sx={{ fontSize: 14, color: "error.main" }}>
          {errorMessage}
        </FormHelperText>
      )}
      <Typography
        component="div"
        sx={{
          textAlign: "left",
          cursor: "pointer",
          color: "primary.main",
          ml: "20px",
          mt: "5px",
          fontFamily: "var(--font-outfit)",
        }}
        onClick={() => setForgotOpen(true)}
      >
        Forgot Password
      </Typography>
      <Button
        type="submit"
        loading={onProgress}
        variant="contained"
        fullWidth
        disableElevation
        sx={{
          my: 2,
          background: "#0977B2",
          color: "#fff",
          ...pillBtnSx,
          fontFamily: "var(--font-urbanist)",
        }}
      >
        Sign In
      </Button>
      <Typography
        component="div"
        sx={{
          display: "flex",
          color: "#fff",
          justifyContent: "center",
          fontFamily: "var(--font-outfit)",
        }}
      >
        Don&apos;t have an account?
        <Box component={NextLink} href="/registration" sx={{ ml: 1.25, color: "#FF0000", textDecoration: "none" }}>
          Register here
        </Box>
      </Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center" }}>
        <Divider sx={{ width: "30%", backgroundColor: "gray" }} />
        <Typography component="div" sx={{ color: "#fff", my: "15px" }}>
          OR
        </Typography>
        <Divider sx={{ width: "30%", backgroundColor: "gray" }} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
        <Button
          type="button"
          variant="outlined"
          color="warning"
          startIcon={<GoogleIcon />}
          onClick={() => signInWithGoogle()}
          loading={googleLoading}
          fullWidth
          disableElevation
          sx={{
            ...pillBtnSx,
            fontFamily: "var(--font-urbanist)",
            textTransform: "none",
          }}
        >
          Sign In with Google
        </Button>
      </Box>

      <Dialog open={forgotOpen} onClose={closeForgot}>
        {passwordReset ? (
          <Box sx={{ px: 3, py: 2 }}>
            <DialogTitle variant="h4" sx={{ fontWeight: 700 }}>
              Create New Password
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                type={showNewPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                value={newPassword}
                label="New Password"
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mt: 3, mb: 2 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword((p) => !p)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                value={confirmPassword}
                label="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {onErrorPassword && (
                <FormHelperText sx={{ fontSize: 14, color: "error.main", mb: 1 }}>
                  Confirm new password does not match.
                </FormHelperText>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeForgot} sx={{ borderRadius: 0 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={submitNewPassword}
                loading={onVerifyProgress}
                sx={{ borderRadius: 0 }}
              >
                Submit New Password
              </Button>
            </DialogActions>
          </Box>
        ) : emailSent ? (
          <Box sx={{ px: 2, py: 2 }}>
            <DialogTitle variant="h4" sx={{ fontWeight: 700 }}>
              Verification Code
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ mb: 2, fontSize: 18 }}>
                Verification code was sent to your email {emailForReset}
              </Typography>
              <TextField
                autoFocus
                fullWidth
                variant="outlined"
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              {onErrorVerificationCode && (
                <FormHelperText sx={{ fontSize: 14, color: "error.main", mb: 1 }}>
                  Invalid verification code.
                </FormHelperText>
              )}
            </DialogContent>
            <DialogActions sx={{ mb: "15px" }}>
              <Button onClick={closeForgot} sx={{ borderRadius: 0 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={submitVerificationCode}
                loading={onVerifyProgress}
                sx={{ borderRadius: 0 }}
              >
                Submit Verification Code
              </Button>
            </DialogActions>
          </Box>
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <DialogTitle variant="h4" sx={{ fontWeight: 700 }}>
              Forgot Password
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ mb: 2, fontSize: 18 }}>
                Please verify your email address, we will send you a
                verification code.
              </Typography>
              <TextField
                autoFocus
                type="email"
                fullWidth
                label="Email address"
                variant="outlined"
                value={emailForReset}
                onChange={(e) => setEmailForReset(e.target.value)}
              />
              {onErrorEmail && (
                <FormHelperText sx={{ fontSize: 14, color: "error.main", mb: 1 }}>
                  Invalid email address.
                </FormHelperText>
              )}
            </DialogContent>
            <DialogActions sx={{ mb: "15px" }}>
              <Button onClick={closeForgot} sx={{ borderRadius: 0 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={submitVerifyEmail}
                loading={onVerifyProgress}
                sx={{ borderRadius: 0 }}
              >
                Send Verification Code
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}

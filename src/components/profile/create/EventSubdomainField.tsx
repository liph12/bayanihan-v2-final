"use client";
import { useState, useEffect, type ChangeEvent } from "react";
import { TextField, InputAdornment, Box, Typography } from "@mui/material";

interface Props {
  setEventFieldByProperty: (key: string, value: unknown) => void;
  subDomainValue: string;
  setIsValidSubDomain: (valid: boolean) => void;
}

function validate(value: string): string {
  if (value.length > 20) {
    return "Subdomain must be 20 characters or less";
  }
  if (value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return "Invalid subdomain. Use only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.";
  }
  return "";
}

export default function EventSubdomainField({
  setEventFieldByProperty,
  subDomainValue,
  setIsValidSubDomain,
}: Props) {
  const [error, setError] = useState("");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.toLowerCase();
    const err = validate(newValue);
    setIsValidSubDomain(!err && newValue.length > 0);
    setEventFieldByProperty("sub_domain", newValue);
    setError(err);
  };

  useEffect(() => {
    const err = validate(subDomainValue);
    setError(err);
    setIsValidSubDomain(!err && subDomainValue.length > 0);
  }, [subDomainValue, setIsValidSubDomain]);

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #c4c4c4",
          borderRadius: "4px",
          overflow: "hidden",
          ...(error ? { borderColor: "error.main" } : {}),
        }}
      >
        <InputAdornment
          position="start"
          sx={{ pl: 1, pr: 0, color: "text.secondary" }}
        >
          https://
        </InputAdornment>
        <TextField
          value={subDomainValue}
          onChange={handleInputChange}
          variant="outlined"
          placeholder="your-event"
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            "& .MuiOutlinedInput-root": {
              "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
            },
            "& .MuiInputBase-input": { padding: "8px 0" },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{ pl: 0, pr: 1, color: "text.secondary" }}
                >
                  .bayanihan.com
                </InputAdornment>
              ),
            },
            htmlInput: {
              maxLength: 20,
              style: { paddingLeft: 0, paddingRight: 0 },
            },
          }}
        />
      </Box>
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {!error && subDomainValue && (
        <Typography color="success.main" variant="caption" sx={{ mt: 1 }}>
          Valid subdomain ({subDomainValue.length}/20) characters: https://
          {subDomainValue}.bayanihan.com
        </Typography>
      )}
    </Box>
  );
}

"use client";
import { Paper, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { type ChangeEvent, type DragEvent, type RefObject } from "react";

interface Props {
  handleLogoDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleLogoChange: (e: ChangeEvent<HTMLInputElement>) => void;
  logoInputRef: RefObject<HTMLInputElement | null>;
  logoImage: File | string | null;
  handleRemoveLogo: () => void;
  placeholder?: string;
}

export default function LogoDropImage({
  handleLogoDrop,
  handleLogoChange,
  logoInputRef,
  logoImage,
  handleRemoveLogo,
  placeholder = "logo",
}: Props) {
  const file =
    logoImage instanceof File ? URL.createObjectURL(logoImage) : logoImage;

  return (
    <>
      <Paper
        sx={{
          height: 150,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          border: "2px dashed #ccc",
          my: 2,
          position: "relative",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleLogoDrop}
        onClick={() => logoInputRef.current?.click()}
      >
        {logoImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file || ""}
              alt="Logo"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveLogo();
              }}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "background.paper",
              }}
            >
              <CloseIcon color="error" />
            </IconButton>
          </>
        ) : (
          <>
            <ImageIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography>Drop {placeholder} here or click to select</Typography>
          </>
        )}
      </Paper>
      <input
        type="file"
        accept="image/png, image/jpeg"
        style={{ display: "none" }}
        ref={logoInputRef}
        onChange={handleLogoChange}
      />
    </>
  );
}

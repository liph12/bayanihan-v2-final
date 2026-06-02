"use client";
import {
  Box,
  ImageList,
  ImageListItem,
  IconButton,
  Button,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  selectedFiles: File[];
  handleSetFeaturedImage: (index: number) => void;
  featuredImageIndex: number | null;
  handleRemoveImage: (index: number) => void;
}

export default function CreateMedia({
  selectedFiles,
  handleSetFeaturedImage,
  featuredImageIndex,
  handleRemoveImage,
}: Props) {
  return (
    <Box sx={{ mt: 2 }}>
      <ImageList
        sx={{ width: "100%", height: "auto" }}
        cols={3}
        rowHeight={164}
      >
        {selectedFiles.map((file, index) => (
          <ImageListItem key={index} sx={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(file)}
              alt={`Selected ${index + 1}`}
              loading="lazy"
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                bgcolor: "error.main",
                borderRadius: 50,
                m: 0.5,
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleRemoveImage(index)}
                sx={{ color: "white" }}
                aria-label={`Remove image ${index + 1}`}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Button
              sx={{
                position: "absolute",
                bottom: 0,
                bgcolor:
                  featuredImageIndex === index ? "none" : "rgba(0, 0, 0, 0.7)",
                color: "white",
                p: 0.5,
                cursor: "pointer",
                borderRadius: 0,
              }}
              fullWidth
              variant="contained"
              color={featuredImageIndex === index ? "primary" : "secondary"}
              onClick={() => handleSetFeaturedImage(index)}
              startIcon={
                <StarIcon
                  color={featuredImageIndex === index ? "warning" : "inherit"}
                />
              }
            >
              Set as featured
            </Button>
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
}

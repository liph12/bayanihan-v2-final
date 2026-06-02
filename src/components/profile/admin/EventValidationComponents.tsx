"use client";
import {
  forwardRef,
  memo,
  useCallback,
  useState,
  type Ref,
} from "react";
import {
  Avatar,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Skeleton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Divider,
  useTheme,
  alpha,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Slide,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import type { SlideProps } from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReactCountryFlag from "react-country-flag";

export interface ValidationEvent {
  id: number | string;
  title?: string;
  description?: string;
  image?: string;
  publishedDate?: string;
  subDomain?: { name?: string };
  user?: {
    name?: string;
    details?: {
      photo?: string;
      country_details?: { code?: string; name?: string };
    };
  };
}

// Slide transition for the dialog
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...(props as SlideProps)} />;
});

// =============================================================================
// EventCard
// =============================================================================
interface EventCardProps {
  event: ValidationEvent;
  onRequestDelete: (eventId: number | string, eventTitle: string) => void;
}

export const EventCard = memo(function EventCard({
  event,
  onRequestDelete,
}: EventCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isHovered, setIsHovered] = useState(false);

  const { id, title, description, user, publishedDate, image, subDomain } =
    event;
  const photo = user?.details?.photo;
  const name = user?.name;
  const countryDetails = user?.details?.country_details;
  const code = countryDetails?.code;
  const eventUrl = `https://${subDomain?.name ?? ""}.bayanihan.com`;
  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleDeleteRequest = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onRequestDelete(id, title || "this event");
    },
    [id, title, onRequestDelete]
  );

  return (
    <Card
      elevation={isHovered ? 4 : 0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${
          isHovered ? "transparent" : theme.palette.divider
        }`,
        transition: "all 0.2s ease-out",
        transform: isHovered ? "translateY(-6px)" : "none",
        position: "relative",
        "&::after": isHovered
          ? {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "10%",
              width: "80%",
              height: "10px",
              borderRadius: "50%",
              boxShadow: "0 15px 15px rgba(0,0,0,0.1)",
              zIndex: -1,
            }
          : {},
      }}
    >
      {/* Card media with overlay */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          height={200}
          image={image || "/no-events.jpg"}
          alt={title}
          sx={{
            objectFit: "cover",
            filter: isHovered ? "brightness(0.85)" : "none",
            transition: "filter 0.2s ease-out, transform 0.6s ease-out",
            transform: isHovered ? "scale(1.03)" : "none",
          }}
        />
        {/* Action buttons */}
        <Box
          sx={{
            position: "absolute",
            top: isMobile ? "auto" : 75,
            bottom: isMobile ? 0 : "auto",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            opacity: isMobile || isHovered ? 1 : 0,
            transition: "opacity 0.2s ease-out",
            pointerEvents: isMobile || isHovered ? "auto" : "none",
            p: isMobile ? 1 : 0,
            bgcolor: isMobile
              ? alpha(theme.palette.background.paper, 0.8)
              : "transparent",
          }}
        >
          <Tooltip title="Delete event" arrow placement="top">
            <IconButton
              onClick={handleDeleteRequest}
              size="medium"
              aria-label="delete event"
              sx={{
                bgcolor: "white",
                color: theme.palette.error.main,
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: theme.palette.error.main,
                  color: "white",
                  transform: "scale(1.1)",
                },
                transform: isMobile || isHovered ? "scale(1)" : "scale(0.8)",
                transition: "all 0.2s ease-out",
              }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open event page" arrow placement="top">
            <IconButton
              component="a"
              href={eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="medium"
              aria-label="open event page"
              sx={{
                bgcolor: "white",
                color: theme.palette.primary.main,
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  transform: "scale(1.1)",
                },
                transform: isMobile || isHovered ? "scale(1)" : "scale(0.8)",
                transition: "all 0.2s ease-out",
              }}
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Card content */}
      <CardContent sx={{ p: 3, pb: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: "1.5rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            transition: "color 0.2s ease-out",
            color: isHovered ? theme.palette.primary.main : "inherit",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            minHeight: "4.5em",
            mb: 2,
          }}
        >
          {description || "No description available"}
        </Typography>
        <Chip
          size="small"
          icon={<CalendarTodayIcon fontSize="small" />}
          label={formattedDate}
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            "& .MuiChip-icon": { color: theme.palette.primary.main },
          }}
        />
      </CardContent>
      <Divider sx={{ mx: 3 }} />

      {/* Footer with user info */}
      <CardActions sx={{ px: 3, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title={name || "User"} arrow>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#44b700",
                  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                },
              }}
            >
              <Avatar
                alt={name}
                src={photo}
                sx={{
                  width: 36,
                  height: 36,
                  border: `2px solid ${theme.palette.background.paper}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
            </Badge>
          </Tooltip>
          {code && (
            <Tooltip title={countryDetails?.name || code} arrow>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  ml: 0.5,
                  borderRadius: 1,
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: `1px solid ${theme.palette.divider}`,
                }}
                variant="rounded"
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
              </Avatar>
            </Tooltip>
          )}
        </Box>
      </CardActions>
    </Card>
  );
});

// =============================================================================
// DeleteConfirmationDialog
// =============================================================================
interface DeleteConfirmationDialogProps {
  open: boolean;
  eventId: number | string | null;
  eventTitle: string;
  onClose: () => void;
  onConfirm: (eventId: number | string) => Promise<boolean>;
}

export const DeleteConfirmationDialog = memo(function DeleteConfirmationDialog({
  open,
  eventId,
  eventTitle,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const theme = useTheme();
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (eventId == null) return;
    setDeleting(true);
    await onConfirm(eventId);
    setDeleting(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      slotProps={{
        paper: {
          elevation: 5,
          sx: {
            borderRadius: 3,
            minWidth: 340,
            maxWidth: "min(90vw, 500px)",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        id="delete-dialog-title"
        sx={{
          bgcolor: alpha(theme.palette.error.light, 0.1),
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.main,
              width: 40,
              height: 40,
            }}
          >
            <ErrorOutlineIcon />
          </Avatar>
          <Typography variant="h6" component="div">
            Confirm Deletion
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 4, pb: 2 }}>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete the event{" "}
          <strong>&quot;{eventTitle}&quot;</strong>? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          disabled={deleting}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
          startIcon={
            deleting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DeleteOutlineIcon />
            )
          }
          sx={{ borderRadius: 2, px: 3, position: "relative" }}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

// =============================================================================
// EventSkeletonCard
// =============================================================================
export const EventSkeletonCard = memo(function EventSkeletonCard() {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        transition: "transform 0.2s ease-out",
      }}
    >
      <Skeleton
        variant="rectangular"
        height={200}
        animation="wave"
        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}
      />
      <CardContent>
        <Skeleton
          variant="text"
          height={32}
          width="70%"
          animation="wave"
          sx={{ mb: 1 }}
        />
        <Skeleton variant="text" height={16} animation="wave" />
        <Skeleton variant="text" height={16} animation="wave" />
        <Skeleton variant="text" height={16} width="60%" animation="wave" />
        <Box sx={{ mt: 2 }}>
          <Skeleton
            variant="rounded"
            width={100}
            height={24}
            animation="wave"
          />
        </Box>
      </CardContent>
      <Divider />
      <CardActions sx={{ px: 2, py: 1.5 }}>
        <Skeleton variant="circular" width={36} height={36} animation="wave" />
        <Skeleton
          variant="circular"
          width={36}
          height={36}
          animation="wave"
          sx={{ ml: 1 }}
        />
      </CardActions>
    </Card>
  );
});

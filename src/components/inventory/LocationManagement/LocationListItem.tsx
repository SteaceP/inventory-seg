import React from "react";
import {
  Box,
  IconButton,
  ListItem,
  ListItemText,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import type { MasterLocation } from "../../../types/inventory";

interface LocationListItemProps {
  location: MasterLocation;
  onEdit: (location: MasterLocation) => void;
  onDelete: (id: string) => Promise<void>;
  depth: number;
}

const LocationListItem: React.FC<LocationListItemProps> = ({
  location,
  onEdit,
  onDelete,
  depth,
}) => {
  const theme = useTheme();

  return (
    <ListItem
      sx={{
        pl: 4 * depth + 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) },
      }}
      secondaryAction={
        <>
          <IconButton
            onClick={() => onEdit(location)}
            size="small"
            sx={{ mr: 1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => {
              void onDelete(location.id);
            }}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      }
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mr: 2,
          color: location.parent_id ? "text.secondary" : "primary.main",
        }}
      >
        {location.parent_id ? (
          <LocationIcon fontSize="small" />
        ) : (
          <FolderIcon />
        )}
      </Box>
      <ListItemText
        primary={location.name}
        secondary={location.description}
        primaryTypographyProps={{
          fontWeight: location.parent_id ? "medium" : "bold",
        }}
      />
    </ListItem>
  );
};

export default LocationListItem;

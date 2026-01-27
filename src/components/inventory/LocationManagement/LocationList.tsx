import React from "react";
import { List } from "@mui/material";
import type { MasterLocation } from "@/types/inventory";
import LocationListItem from "./LocationListItem";

interface LocationListProps {
  locations: MasterLocation[];
  onEdit: (location: MasterLocation) => void;
  onDelete: (id: string) => Promise<void>;
}

const LocationList: React.FC<LocationListProps> = ({
  locations,
  onEdit,
  onDelete,
}) => {
  const buildHierarchy = (parentId: string | null = null, depth = 0) => {
    return locations
      .filter((l) => l.parent_id === parentId)
      .map((location) => (
        <React.Fragment key={location.id}>
          <LocationListItem
            location={location}
            onEdit={onEdit}
            onDelete={onDelete}
            depth={depth}
          />
          {buildHierarchy(location.id, depth + 1)}
        </React.Fragment>
      ));
  };

  return <List disablePadding>{buildHierarchy(null)}</List>;
};

export default LocationList;

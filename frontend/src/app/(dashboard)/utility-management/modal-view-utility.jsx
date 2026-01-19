"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";

const ModalViewUtility = ({ open, onClose, utility }) => {
  if (!utility) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Utility Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              ID
            </Typography>
            <Typography variant="body1">{utility.id}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary">
              Utility Name
            </Typography>
            <Typography variant="h6">{utility.name}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary">
              Area
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip label={utility.area?.name || "N/A"} color="primary" />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary">
              Description
            </Typography>
            <Typography variant="body1">
              {utility.description || "No description provided"}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Mapped Devices ({utility.deviceMappings?.length || 0})
            </Typography>

            {utility.deviceMappings && utility.deviceMappings.length > 0 ? (
              <Paper variant="outlined">
                <List>
                  {utility.deviceMappings.map((mapping, index) => (
                    <ListItem
                      key={mapping.id}
                      divider={index < utility.deviceMappings.length - 1}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={`#${index + 1}`}
                              size="small"
                              color="default"
                            />
                            <Typography fontWeight="500">
                              {mapping.device?.name}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" display="block">
                              Serial: {mapping.device?.serial_number}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={mapping.device?.status?.name || "N/A"}
                                size="small"
                                color={
                                  mapping.device?.status?.name === "Normal"
                                    ? "success"
                                    : mapping.device?.status?.name === "Fault"
                                      ? "error"
                                      : "default"
                                }
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ) : (
              <Typography color="textSecondary" variant="body2">
                No devices mapped to this utility
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Created: {new Date(utility.created_at).toLocaleString()}
            </Typography>
            <br />
            <Typography variant="caption" color="textSecondary">
              Last Updated: {new Date(utility.updated_at).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalViewUtility;

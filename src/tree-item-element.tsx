import { Box, Button, IconButton } from "@mui/material";
import { ItemRenderProps } from "@progress/kendo-react-treeview";
import { FC } from "react";
import MenuIcon from "@mui/icons-material/Menu";

const TreeItemElement: FC<ItemRenderProps> = ({ item }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <IconButton>
      <MenuIcon fontSize="small" />
    </IconButton>
    <span>{item.text}</span>
  </Box>
);

export default TreeItemElement;

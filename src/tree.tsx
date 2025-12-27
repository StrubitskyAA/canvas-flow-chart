import { FC } from "react";
import { Box, Button } from "@mui/material";
import data from "./data-kendo.json";
import { useState } from "react";

import {
  TreeView,
  TreeViewExpandChangeEvent,
  TreeViewCheckChangeEvent,
  TreeViewItemClickEvent,
  TreeViewCheckDescriptor,
  TreeViewOperationDescriptor,
  TreeViewCheckChangeSettings,
  processTreeViewItems,
  handleTreeViewCheckChange,
} from "@progress/kendo-react-treeview";
import TreeItemElement from "./tree-item-element";

type TreeViewDataItem = {
  text: string;
  label?: string;
  expanded?: boolean;
  checked?: boolean;
  selected?: boolean;
  items?: TreeViewDataItem[];
};

export type itemDataType = {
  itemId: string;
  label: string;
  children?: itemDataType[];
};

const TreeComponent: FC = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [check, setCheck] = useState<string[] | TreeViewCheckDescriptor>([]);
  const [expand, setExpand] = useState<TreeViewOperationDescriptor>({
    ids: ["Item2"],
    idField: "text",
  });
  const [select, setSelect] = useState<string[]>([""]);

  const onItemClick = (event: TreeViewItemClickEvent) => {
    setSelect([event.itemHierarchicalIndex]);
  };

  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    const ids: string[] = expand.ids ? expand.ids.slice() : [];
    const index: number = ids.indexOf(event.item.text);

    index === -1 ? ids.push(event.item.text) : ids.splice(index, 1);
    setExpand({ ids, idField: "text" });
  };

  const onCheckChange = (event: TreeViewCheckChangeEvent) => {
    const settings: TreeViewCheckChangeSettings = {
      singleMode: false,
      checkChildren: false,
      checkParents: false,
    };
    setCheck(handleTreeViewCheckChange(event, check, data, settings));
  };
  return (
    <>
      <Button
        sx={{ mr: 2 }}
        color="success"
        onClick={() => setExpandedItems([])}
      >
        Открыть все
      </Button>
      <Button color="error" onClick={() => setExpandedItems([])}>
        Скрыть все
      </Button>
      <Box sx={{ minHeight: 352, width: 250 }}>
        <TreeView
          data={processTreeViewItems(data, {
            select: select,
            check: check,
            expand: expand,
          })}
          draggable={true}
          expandIcons={true}
          onExpandChange={onExpandChange}
          aria-multiselectable={true}
          onItemClick={onItemClick}
          checkboxes={true}
          onCheckChange={onCheckChange}
          item={TreeItemElement}
          onItemDragStart={(event) => console.log("start = ", event.item)}
          onItemDragOver={(event) => console.log("over = ", event.item)}
          onItemDragEnd={(event) => console.log("end = ", event.item)}
        />
      </Box>
    </>
  );
};

export default TreeComponent;

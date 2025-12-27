import { FC } from "react";
import { TreeItem } from "@mui/x-tree-view";

import { itemDataType } from "./tree";

const Item: FC<{ data: itemDataType[] }> = ({ data }) => {
  return (
    <>
      {data.map((d) => (
        <TreeItem key={d.itemId} itemId={d.itemId} label={d.label}>
          {d.children?.length ? <Item data={d.children} /> : null}
        </TreeItem>
      ))}
    </>
  );
};

export default Item;

import React from "react";
import ActionsCell from "./ActionCell";
import { isDateString } from '../utils/dataUtils';

interface Record {
  [key: string]: string | number | string[] | number[] | undefined;
  id: string | number; // Changed to allow both string and number since the index signature includes both
}

interface TableRowProps {
  record: Record;
  columns: string[];
  onEdit: () => void;
  onDelete: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ record, columns, onEdit, onDelete }) => (
  <tr>
    {columns.map((col) => (
      <td key={col}>
        {Array.isArray(record[col])
          ? record[col].join(", ")
          : isDateString(record[col]) && record[col]
          ? new Date(record[col] as string).toLocaleString()
          : record[col] || "N/A"}
      </td>
    ))}
    <ActionsCell onEdit={onEdit} onDelete={onDelete} />
  </tr>
);

export default TableRow;

import React from "react";

interface TableHeaderProps {
  columns: string[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => (
  <thead>
    <tr>
      {columns.map((col) => (
        <th key={col}>{col.replace(/_/g, " ").toUpperCase()}</th>
      ))}
      <th>Actions</th>
    </tr>
  </thead>
);

export default TableHeader;

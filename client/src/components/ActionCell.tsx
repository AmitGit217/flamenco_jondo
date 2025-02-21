import React from "react";

interface ActionsCellProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionsCell: React.FC<ActionsCellProps> = ({ onEdit, onDelete }) => (
  <td>
    <button className="edit-button" onClick={onEdit}>✏️ Edit</button>
    <button className="delete-button" onClick={onDelete}>❌ Delete</button>
  </td>
);

export default ActionsCell;

import React from "react";

interface AddRecordButtonProps {
  onClick: () => void;
}

const AddRecordButton: React.FC<AddRecordButtonProps> = ({ onClick }) => (
  <button className="add-button" onClick={onClick}>+ Add Record</button>
);

export default AddRecordButton;

import React, { useCallback } from "react";
import Modal from "./Modal";
import DynamicForm from "./DynamicForm";
import { FormData } from "./DynamicForm";
import { getStaticDataByType } from "../api/common";

interface RecordModalProps {
  isOpen: boolean;
  model: string;
  record?: FormData;
  onClose: () => void;
  setRecords: (records: FormData[]) => void;
}

const RecordModal: React.FC<RecordModalProps> = ({ isOpen, model, record, onClose, setRecords }) => {
  // ✅ useCallback prevents unnecessary function re-creation on each render
  const handleSuccess = useCallback(() => {
    onClose();

    getStaticDataByType(model)
      .then(setRecords) // Directly pass data to setRecords
      .catch((error) => console.error("Error fetching records:", error));
  }, [model, onClose, setRecords]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <DynamicForm model={model} record={record} onClose={onClose} onSuccess={handleSuccess} />
    </Modal>
  );
};

export default RecordModal;

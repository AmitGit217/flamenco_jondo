import React from "react";
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
  const handleSuccess = () => {
    onClose();
    getStaticDataByType(model)
      .then((data) => setRecords(data))
      .catch((error) => console.error("Error fetching records:", error));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <DynamicForm model={model} record={record} onClose={onClose} onSuccess={handleSuccess} />
    </Modal>
  );
};

export default RecordModal;

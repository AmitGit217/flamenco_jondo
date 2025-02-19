import { useEffect, useState } from "react";
import {  useParams } from "react-router-dom";
import { getStaticDataByType } from "../api/static-data";
import "../style/RecordTable.scss";
import Modal from "./Modal";
import DynamicForm from "./DynamicForm";
import { FormData } from "./DynamicForm";

interface Record {
  [key: string]: string | number | string[] | number[] | undefined;
  id: number;
  created_at: string;
  updated_at: string;
}

const isDateString = (value: string | number | string[] | number[] | undefined): boolean => {
  if (!value || Array.isArray(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

const RecordTable = () => {
  const { model } = useParams<{ model: string }>();
  const [records, setRecords] = useState<Record[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [columns, setColumns] = useState<string[]>([]); // Store dynamic columns

  useEffect(() => {
    if (!model) return;

    getStaticDataByType(model)
      .then((data: Record[]) => {
        if (data.length > 0) {
          setColumns(Object.keys(data[0])); // Extract columns dynamically
        }
        setRecords(data);
      })
      .catch((error: Error) => console.error("Error fetching records:", error));
  }, [model]);

  if (!model) return null;

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    fetch(`/${model}/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setRecords(records.filter((record) => record.id !== id));
      })
      .catch((error) => console.error("Error deleting record:", error));
  };

  return (
    <div className="record-table">
      <h1>{model.charAt(0).toUpperCase() + model.slice(1)} Records</h1>
      <button className="add-button" onClick={() => { setIsModalOpen(true); }}>
        + Add Record
      </button>

      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col.replace(/_/g, " ").toUpperCase()}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {columns.map((col) => (
                <td key={col}>
                  {Array.isArray(record[col])
                    ? record[col].join(", ")
                    : isDateString(record[col]) && record[col]
                      ? new Date(record[col] as string).toLocaleString()
                      : record[col] || "N/A"}
                </td>
              ))}
              <td>
                <button
                  className="edit-button"
                  onClick={() => {
                    setIsModalOpen(true);
                    setSelectedRecord(record);
                  }}
                >
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(record.id)} className="delete-button">
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DynamicForm
          model={model}
          record={selectedRecord as FormData}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      </Modal>
    </div>
  );
};

export default RecordTable;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { deleteRecord, getStaticDataByType } from "../api/common";
import "../style/RecordTable.scss";
import AddRecordButton from '../components/AddRecordButton';
import TableHeader from "../components/TableHeader";
import TableRow from "../components/TableRow";
import RecordModal from "../components/RecordModal";
import { FormData } from '../components/DynamicForm';


interface Record {
  [key: string]: string | number | string[] | number[] | undefined;
  id: number;
  created_at: string;
  updated_at: string;
}

const RecordTable = () => {
  const { model } = useParams<{ model: string }>();
  const [records, setRecords] = useState<Record[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FormData | undefined>(undefined);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!model) return;
    getStaticDataByType(model)
      .then((data: Record[]) => {
        if (data.length > 0) setColumns(Object.keys(data[0]));
        setRecords(data);
      })
      .catch((error: Error) => console.error("Error fetching records:", error));
  }, [model]);

  if (!model) return null;

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    deleteRecord(model, id)
      .then(() => {
        setRecords(records.filter((record) => record.id !== id));
      })
      .catch((error: Error) => console.error("Error deleting record:", error));
  };


  return (
    <div className="record-table">
      <h1>{model.charAt(0).toUpperCase() + model.slice(1)} Records</h1>

      <AddRecordButton onClick={() => setIsModalOpen(true)} />

      <table>
        <TableHeader columns={columns} />
        <tbody>
          {records.map((record) => (
            <TableRow
              key={record.id}
              record={record}
              columns={columns}
              onEdit={() => {
                setIsModalOpen(true);
                setSelectedRecord(record as FormData);
              }}
              onDelete={() => handleDelete(record.id)}
            />
          ))}
        </tbody>
      </table>

      <RecordModal
        isOpen={isModalOpen}
        model={model}
        record={selectedRecord}
        onClose={() => setIsModalOpen(false)}
        setRecords={(records: FormData[]) => {
          setRecords(records as Record[]);
        }}
      />
    </div>
  );
};

export default RecordTable;

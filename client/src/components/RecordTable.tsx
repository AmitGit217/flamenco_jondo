import  { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStaticDataByType } from "../api/static-data";
import "../style/RecordTable.scss";

interface Record {
  id: number;
  created_at: string;
  updated_at: string | null;
}

const RecordTable = () => {
  const { model } = useParams<{ model: string }>();
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    if (!model) return;
    
    getStaticDataByType(model)
      .then((data: Record[]) => setRecords(data))
      .catch((error: Error) => console.error("Error fetching records:", error));
  }, [model]);

  if (!model) return null;

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    fetch(`/api/${model}/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setRecords(records.filter((record) => record.id !== id));
      })
      .catch((error) => console.error("Error deleting record:", error));
  };

  return (
    <div className="record-table">
      <h1>{model.charAt(0).toUpperCase() + model.slice(1)} Records</h1>
      <Link to={`/dashboard/${model}/add`} className="add-button">
        + Add Record
      </Link>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{new Date(record.created_at).toLocaleString()}</td>
              <td>{record.updated_at ? new Date(record.updated_at).toLocaleString() : "N/A"}</td>
              <td>
                <Link to={`/dashboard/${model}/edit/${record.id}`} className="edit-button">
                  ✏️ Edit
                </Link>
                <button onClick={() => handleDelete(record.id)} className="delete-button">
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordTable;

import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [columnNames, setColumnNames] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [renamedColumns, setRenamedColumns] = useState({});
  const [tableName, setTableName] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("csvFile", selectedFile);

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        setColumnNames(data.column_names);
        setDataRows(data.data_rows);
        setFileName(data.filename);
        // Initialize renamedColumns state with empty strings for each column
        const initialRenamedColumns = {};
        data.column_names.forEach((columnName) => {
          initialRenamedColumns[columnName] = "";
        });
        setRenamedColumns(initialRenamedColumns);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleRenameChange = (event, columnName) => {
    setRenamedColumns((prevState) => ({
      ...prevState,
      [columnName]: event.target.value,
    }));
  };

  const handleTableNameChange = (event) => {
    setTableName(event.target.value);
  };

  const handleUpdateNames = () => {
    // Create a payload containing the renamed columns and the table name
    const payload = {
      tableName: tableName,
      renamedColumns: renamedColumns,
      fileName: fileName,
    };

    fetch("/update-names", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="csv-uploader">
      <h1>Upload a CSV File</h1>
      <input type="file" onChange={handleFileChange} accept=".csv" />
      <button onClick={handleUpload}>Upload</button>
      <div className="message">{message}</div>

      {dataRows.length > 0 && (
        <div>
          <input
            type="text"
            value={tableName}
            onChange={handleTableNameChange}
            placeholder="Enter table name"
          />

          <button onClick={handleUpdateNames}>Save table</button>

          <div>
            <table className="csv-table">
              <thead>
                <tr>
                  {columnNames.map((columnName, index) => (
                    <th key={index}>{columnName}</th>
                  ))}
                </tr>
                <tr>
                  {columnNames.map((columnName, index) => (
                    <td key={index}>
                      <input
                        type="text"
                        value={renamedColumns[columnName]}
                        onChange={(event) =>
                          handleRenameChange(event, columnName)
                        }
                        placeholder="Rename"
                      />
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((rowData, rowIndex) => (
                  <tr key={rowIndex}>
                    {rowData.map((cellData, cellIndex) => (
                      <td key={cellIndex}>{cellData}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

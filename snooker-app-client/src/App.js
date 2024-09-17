import React, { useState } from "react";
import "./App.css"; // You can create this CSS file to style your app
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCpQIdXWPP5DLH8vsErmCKIPsXVHzvKAi4",
  authDomain: "snooker-app-demo.firebaseapp.com",
  projectId: "snooker-app-demo",
  storageBucket: "snooker-app-demo.appspot.com",
  messagingSenderId: "388093677326",
  appId: "1:388093677326:web:67c3de99f6df992b01915f",
  databaseURL:
    "https://snooker-app-demo-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase();

function App() {
  // State to manage customer entries for all tables
  const [customerEntries, setCustomerEntries] = useState([]);

  // State for input fields for all tables
  const [tablesData, setTablesData] = useState(
    Array.from({ length: 7 }, () => ({
      customerName: "",
      loginTime: "",
      logoutTime: "",
      totalTime: 0,
      totalAmount: 0,
      loginDisabled: true,
      logoutDisabled: true,
    }))
  );

  // Function to handle typing in customer name
  const handleNameChange = (event, tableIndex) => {
    const newTablesData = [...tablesData];
    newTablesData[tableIndex].customerName = event.target.value;
    newTablesData[tableIndex].loginDisabled =
      event.target.value === "" ? true : false;
    setTablesData(newTablesData);
  };

  // Function to handle Log In button click
  const handleLogin = (tableIndex) => {
    const currentTime = new Date();
    const tableDataCopy = [...tablesData];
    tableDataCopy[
      tableIndex
    ].loginTime = `${currentTime.getHours()}:${currentTime.getMinutes()}`;
    tableDataCopy[tableIndex].logoutDisabled = false;
    tableDataCopy[tableIndex].loginDisabled = true;
    setTablesData(tableDataCopy);
  };

  // Function to handle Log Out button click
  const handleLogout = async (tableIndex) => {
    try {
      const currentTime = new Date();
      const tableDataCopy = [...tablesData];
      tableDataCopy[
        tableIndex
      ].logoutTime = `${currentTime.getHours()}:${currentTime.getMinutes()}`;

      const loginTimestamp = new Date(
        `2024-01-01 ${tableDataCopy[tableIndex].loginTime}`
      );
      const logoutTimestamp = new Date(
        `2024-01-01 ${currentTime.getHours()}:${currentTime.getMinutes()}`
      );
      const timeDifference = (logoutTimestamp - loginTimestamp) / (1000 * 60);
      tableDataCopy[tableIndex].totalTime = timeDifference;
      const amount = timeDifference >= 1 ? timeDifference * 5 : 0;
      tableDataCopy[tableIndex].totalAmount = amount.toFixed(2);
      tableDataCopy[tableIndex].logoutDisabled = true;
      tableDataCopy[tableIndex].loginDisabled = false;
      setTablesData(tableDataCopy);

      // Create a reference to the database node for the specific table
      const tableRef = ref(database, `tables/table${tableIndex + 1}`);

      // Push the new entry to the database
      await push(tableRef, {
        customerName: tableDataCopy[tableIndex].customerName,
        loginTime: tableDataCopy[tableIndex].loginTime,
        logoutTime: tableDataCopy[tableIndex].logoutTime,
        totalTime: tableDataCopy[tableIndex].totalTime,
        totalAmount: tableDataCopy[tableIndex].totalAmount,
      });

      // Add entry to the customerEntries array
      if (tableDataCopy[tableIndex].customerName.trim() !== "") {
        setCustomerEntries((prevEntries) => [
          ...prevEntries,
          {
            id: Date.now(),
            name: tableDataCopy[tableIndex].customerName,
            tableNumber: tableIndex + 1,
            totalAmount: tableDataCopy[tableIndex].totalAmount,
            totalTime: tableDataCopy[tableIndex].totalTime,
          },
        ]);
      }
    } catch (error) {
      console.error("Error handling logout:", error);
    }
  };

  // Function to handle New Entry button click
  const handleNewEntry = (tableIndex) => {
    const tableDataCopy = [...tablesData];
    tableDataCopy[tableIndex] = {
      customerName: "",
      loginTime: "",
      logoutTime: "",
      totalTime: 0,
      totalAmount: 0,
      loginDisabled: true,
      logoutDisabled: true,
    };
    setTablesData(tableDataCopy);
  };

  return (
    <div className="App">
      <h1>Welcome to Cue In Snooker Club</h1>

      <div className="grid-container">
        {/* Entry Form for each table */}
        {tablesData.map((tableData, index) => (
          <div key={index} className="table">
            <h2>Table {index + 1}</h2>
            <form>
              <input
                type="text"
                placeholder="Enter customer name"
                value={tableData.customerName}
                onChange={(e) => handleNameChange(e, index)}
                required
              />
              <br />
              <input
                type="text"
                placeholder="Login Time"
                value={tableData.loginTime}
                readOnly
              />
              <input
                type="text"
                placeholder="Logout Time"
                value={tableData.logoutTime}
                readOnly
              />
              <br />
              <input
                type="text"
                placeholder="Total Time (minutes)"
                value={tableData.totalTime}
                readOnly
              />
              <br />
              <input
                type="text"
                placeholder="Total Amount"
                value={`$${tableData.totalAmount}`}
                readOnly
              />
              <br />
              <button
                type="button"
                onClick={() => handleLogin(index)}
                disabled={tableData.loginDisabled}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => handleLogout(index)}
                disabled={tableData.logoutDisabled}
              >
                Log Out
              </button>
              <button
                type="button"
                onClick={() => handleNewEntry(index)}
                disabled={tableData.customerName.trim() === ""}
              >
                New Entry
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Last 5 Entries */}
      <div className="last-entries">
        <h2>Last 5 Entries</h2>
        <ul>
          {customerEntries.slice(0, 5).map((entry) => (
            <li key={entry.id}>
              <strong>{entry.name}</strong> - Table: {entry.tableNumber}, Total
              Time: {entry.totalTime} minutes, Total Amount: $
              {entry.totalAmount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

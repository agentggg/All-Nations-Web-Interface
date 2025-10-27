import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./send.css";
import ipAddress from "./config";
import ImageUploader from "../resuseableComponent/UploadImage";
import { useNavigate } from "react-router-dom";

export default function SendByCategory() {
  const auth = JSON.parse(localStorage.getItem("authToken")) || {};
  const token = auth?.token || "";
  const username = auth?.username || "";
  const org = auth?.org || "";
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [message, setMessage] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [eachContact, setEachContact] = useState(["None"])
  // const [scheduleTime, setScheduleTime] = useState("09/04/2025 11:24 AM");
  const navigate = useNavigate();
  const [file, setFile] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchContacts(); 
  }, [username]); 

  const logout = () => {
    localStorage.removeItem("authToken");
    showToast("You have been logged out.", "info");
    setTimeout(() => (window.location.href = "/login"), 1500);
  };

  const goBack = () => {
    navigate(-1)
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleChange = async (event) => {
      await setSelectedRecipients(event.target.value);
      const res = await fetch(`${ipAddress}/view_recipient`, {
      method: "POST",        
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org:org, username:username, "groupType":"categories_contacts", contactType:[event.target.value] }),
      }
    );
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setEachContact(data)
  }; 

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${ipAddress}/categories_contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify({ org, username, pageName: "contacts_contacts", setView: "all_contacts" }),
      });

      if (!response.ok) throw new Error("Failed to fetch contacts");

      const data = await response.json();
      setRecipients(
        data.map((item) => ({
          label: item.category,
          value: item.category,
        }))
      );
    } catch (err) {
      console.error("❌ Error loading contacts:", err);
      showToast("Error loading contacts.", "danger");
    }
  };
 
  const validateDateTime = (dateTime) => {
    const regex =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}\s(0[1-9]|1[0-2]):([0-5][0-9])\s(AM|PM)$/i;
    return regex.test(dateTime);
  };

const sendMessage = async () => {
  let endpoint = "category_text";
  if (!message) return showToast("Please enter a message.", "warning");
  if (scheduleTime && !validateDateTime(scheduleTime))
    return showToast("Invalid date format. Use MM/DD/YYYY HH:MM AM/PM", "danger");
  if (scheduleTime) endpoint = "scheduled_messages";

  // ---- If there's a file, use FormData ----
  let body;
  let headers;
  // ---- Otherwise, send JSON ----
  const apiData = {
    username,
    org,
    message,
    scheduledDateTime: scheduleTime,
    selectOption: "contacts_contacts",
    contactSelection: { contact: [selectedRecipients] },
    file: file
  };

  body = JSON.stringify(apiData);
  headers = {
    "Content-Type": "application/json",
    Authorization: `token ${token}`,
  };
  

  try {
    const response = await fetch(`${ipAddress}/${endpoint}`, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) throw new Error("Failed to send message");
    showToast("Message sent successfully!", "success");

    navigate(-1)  } 
catch (err) {
    console.error(err);
    showToast("Message failed to send.", "danger");
  }
};

  return (
    <div className="container my-5">
      <button className="btn  btn-sm btn-light mb-5 align-self-end" onClick={goBack}>
        <div class="text-right">Go Back</div>
      </button>
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`toast align-items-center text-bg-${toast.type} border-0 show position-fixed top-0 end-0 m-3`}
          role="alert"
          style={{ zIndex: 1055 }}
        >
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setToast({ show: false, message: "", type: "success" })}
            ></button>
          </div>
        </div>
      )}

      <div className="card bg-dark text-light shadow-lg p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-warning">Send Message To Category</h2>
          <button className="btn btn-outline-light btn-sm btn-danger" onClick={logout}>
            Logout
          </button>
        </div>

        {/* Select Contact Type */}
        <div className="mb-3">
          <label className="form-label">All Nation Web Interface</label>
        </div>
          <div>
      <label htmlFor="dynamic-select">Select an option:</label>
      <select id="dynamic-select" value={selectedRecipients} onChange={handleChange}>
        <option value="">--Please choose an option--</option> {/* Optional default option */}
        {recipients.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selectedRecipients && <p>You selected: {selectedRecipients}</p>}
    </div>
        {/* Message Box */}
        <div className="mb-3">
          <label className="form-label">Message:</label>
          <textarea
            rows="5"
            className="form-control"
            placeholder="Your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* File Upload */}
        <div className="mb-3">
          <label className="form-label text-warning fw-bold">Attach Images (optional):</label>
          <ImageUploader
            onUploadComplete={(url) => {
              setFile(url);
            }}
          />
        </div>

        {/* Schedule Time */}
        <div className="mb-3">
          <label className="form-label">Schedule Time (optional):</label>
          <input
            type="text"
            className="form-control"
            placeholder="MM/DD/YYYY HH:MM AM/PM"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
          />
        </div>

        {/* Send Button */}
        <div className="d-grid">
          <button className="btn btn-danger btn-lg" onClick={sendMessage}>
            Send
          </button>
        </div>

        {/* Recipients Preview */}
        <div className="mt-4">
          <strong>Recipients Preview:</strong>
          <div className="mt-2 p-2 rounded bg-secondary text-light bg-light text-dark"> 
            <div className="container text-center">
            <div className="row">
                {eachContact.map((each_contact_name, index) => (
                <div className="col-12 col-md-4 mb-3" key={index}>
                    <p className="text-dark border rounded border-secondary p-2 text-center">
                    <small>{each_contact_name}</small>
                    </p>
                </div>
                ))}
            </div>
            </div>
          </div>
        </div>
      </div>
        <p className="small mt-3">Version 2025.10.13.01</p>
    </div>
  );
}
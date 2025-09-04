import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./send.css";

const ipAddress = "http://127.0.0.1:8000";
// const ipAddress = "http://allnations-agentofgod.pythonanywhere.com";

export default function SendAll() {
  const auth = JSON.parse(localStorage.getItem("authToken")) || {};
  const token = auth?.token || "";
  const username = auth?.username || "";
  const org = auth?.org || "";
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [message, setMessage] = useState("Lorum Ipsum");
  const [scheduleTime, setScheduleTime] = useState("09/04/2025 11:24 AM");
  const [file, setFile] = useState(null);
 
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

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fileData = file ? {
  name: file.name,
  type: file.type,
  size: file.size,
  lastModified: file.lastModified,
} : null;

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${ipAddress}/contacts_contacts?format=json`, {
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
          label: item.name || item.first_name || item.phone_number,
          value: item.phone_number,
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
    const recipientsToSend = sendToAll ? ["All"] : selectedRecipients;
    let endpoint = "contact_text"
    if (!message) return showToast("Please enter a message.", "warning");
    if (scheduleTime && !validateDateTime(scheduleTime))
        return showToast("Invalid date format. Use MM/DD/YYYY HH:MM AM/PM", "danger");
    if (scheduleTime) {
        endpoint = "scheduled_messages"
    }
    const formData = new FormData();
    formData.append("username", username);
    formData.append("org", org);
    formData.append("message", message); // Django decodes it
    formData.append("scheduledDateTime", scheduleTime);
    formData.append("selectOption", "contacts_contacts");
    formData.append("contactSelection", JSON.stringify({ contact: recipientsToSend }));
    if (file) formData.append("file", file);

    try {  
      console.log("Sending to recipients:", recipientsToSend);
      const response = await fetch(`${ipAddress}/${endpoint}`, {
        method: "POST",
        headers: { Authorization: `token ${token}` }, // no Content-Type, browser sets it
        body: formData,
    });

      if (!response.ok) throw new Error("Failed to send message");
      showToast("Message sent successfully!", "success");

      // Reset fields
      setSendToAll(false);
      setSelectedRecipients([]);
      setMessage("");
      setScheduleTime("");
      setFile(null);
    } catch (err) {
      console.error(err);
      showToast("Message failed to send.", "danger");
    }
  };

  return (
    <div className="container my-5">
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
          <h2 className="text-warning">Send Message To All Contacts</h2>
          <button className="btn btn-outline-light btn-sm" onClick={logout}>
            Logout
          </button>
        </div>

        {/* Select Contact Type */}
        <div className="mb-3">
          <label className="form-label">All Nation Web Interface</label>
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
          <label className="form-label">Upload Image (optional):</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
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
          <div
            className={`mt-2 p-2 rounded ${
              sendToAll ? "bg-secondary text-light" : "bg-light text-dark"
            }`}
          > 
            <div className="container text-center">
            <div className="row">
                {recipients.map((each_contact_name, index) => (
                <div className="col-12 col-md-4 mb-3" key={index}>
                    <p className="text-dark border rounded border-secondary p-2 text-center">
                    <small>{each_contact_name["label"]}</small>
                    </p>
                </div>
                ))}
            </div>
            </div>
          </div>
        </div>
      </div>
        <p className="small mt-3">Version 2025.09.02.01</p>
    </div>
  );
}
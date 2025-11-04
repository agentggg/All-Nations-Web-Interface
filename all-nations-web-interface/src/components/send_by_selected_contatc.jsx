// send_by_selected_contact.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./send.css";
import ipAddress from "./config";
import ImageUploader from "../resuseableComponent/UploadImage";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function SendBySelectedContacts() {
  const auth = JSON.parse(localStorage.getItem("authToken")) || {};
  const token = auth?.token || "";
  const username = auth?.username || "";
  const org = auth?.org || "";
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate();

  // UI state
  const [message, setMessage] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [file, setFile] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Contacts
  const [contacts, setContacts] = useState([]);               // [{id, first_name, last_name, ...}]
  const [selectedIds, setSelectedIds] = useState(new Set());  // Set of contact IDs
  const [search, setSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true); // ⬅️ NEW

  useEffect(() => {
    fetchAllContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const onLogout = () => {
    // Use context: clears token + flips isAuthenticated=false
    logout();
    showToast("You have been logged out.", "info");
  };

  const goBack = () => navigate(-1);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const validateDateTime = (dateTime) => {
    const regex =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}\s(0[1-9]|1[0-2]):([0-5][0-9])\s(AM|PM)$/i;
    return regex.test(dateTime);
  };

  /** Fetch ALL contacts (no category filter) */
  const fetchAllContacts = async () => {
    try {
      setLoadingContacts(true); // ⬅️ start spinner
      const response = await fetch(`${ipAddress}/contacts_contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        // Keep your existing contract; backend will now return full contact objects
        body: JSON.stringify({ org, username, pageName: "contacts_contacts", setView: "all_contacts" }),
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      // Expecting array of objects with { id, first_name, last_name, ... }
      const normalized = Array.isArray(data) ? data : [];
      setContacts(normalized);
      setSelectedIds(new Set()); // reset selection on full refresh
    } catch (err) {
      console.error("❌ Error loading contacts:", err);
      showToast("Error loading contacts.", "danger");
    } finally {
      setLoadingContacts(false); // ⬅️ stop spinner
    }
  };

  /** Filter contacts by first, last, or full name */
  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const first = (c.first_name || "").toLowerCase();
      const last = (c.last_name || "").toLowerCase();
      const full = `${first} ${last}`.trim();
      return first.includes(q) || last.includes(q) || full.includes(q);
    });
  }, [contacts, search]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const selectedAsArray = useMemo(
    () => contacts.filter((c) => selectedIds.has(c.id)),
    [contacts, selectedIds]
  );

  const sendMessage = async () => {
    if (!message) return showToast("Please enter a message.", "warning");
    if (scheduleTime && !validateDateTime(scheduleTime))
      return showToast("Invalid date format. Use MM/DD/YYYY HH:MM AM/PM", "danger");
    if (selectedIds.size < 1) return showToast("Select at least one contact.", "warning");

    const endpoint = scheduleTime ? "scheduled_messages" : "contact_text";

    // Build array of FIRST NAMES from the selected IDs
    const selectedFirstNames = contacts
      .filter((c) => selectedIds.has(c.id))
      .map((c) => c.first_name)
      .filter(Boolean);

    // Optional: de-dupe first names if the list can contain duplicates
    const uniqueFirstNames = Array.from(new Set(selectedFirstNames));

    const apiData = {
      username,
      org,
      message,
      scheduledDateTime: scheduleTime,
      selectOption: "contacts_contacts",
      // ⬇️ send FIRST NAMES instead of IDs
      contactSelection: { contact: uniqueFirstNames },
      file: file,
    };

    try {
      const response = await fetch(`${ipAddress}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) throw new Error("Failed to send message");
      showToast("Message sent successfully!", "success");
      navigate(-1);
    } catch (err) {
      console.error(err);
      showToast("Message failed to send.", "danger");
    }
  };

  return (
    <div className="container my-5">
      <button className="btn btn-sm btn-light mb-5 align-self-end" onClick={goBack}>
        <div className="text-right">Go Back</div>
      </button>

      {/* Toast */}
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
          <h2 className="text-warning">Send Message To Contacts</h2>
          <button className="btn btn-outline-light btn-sm btn-danger" onClick={onLogout}>
            Logout
          </button>
        </div>

        {/* Search */}
        <div className="mb-3">
          <label className="form-label">Search Contacts</label>
          <input
            className="form-control"
            placeholder="Search by first, last, or full name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={!contacts.length || loadingContacts} // ⬅️ disable while loading
          />
          <small className="text-muted">
            {loadingContacts
              ? "Loading contacts…"
              : `${filteredContacts.length} matching / ${contacts.length} total`}
          </small>
        </div>

        {/* Selected chips */}
        <div className="mb-3">
          <label className="form-label">Selected ({selectedIds.size})</label>
          <div className="d-flex flex-wrap gap-2">
            {selectedAsArray.length === 0 && (
              <span className="text-muted small">None selected</span>
            )}
            {selectedAsArray.map((c) => {
              const full =
                `${c.first_name || ""} ${c.last_name || ""}`.trim() || "(Unnamed)";
              return (
                <span
                  key={`chip_${String(c.id)}`}
                  className="badge rounded-pill text-bg-warning me-2 mb-2"
                >
                  {full}
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-dark ms-2 p-0"
                    onClick={() => removeSelected(c.id)}
                    aria-label={`Remove ${full}`}
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea
            rows="5"
            className="form-control"
            placeholder="Your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* File upload */}
        <div className="mb-3">
          <label className="form-label text-warning fw-bold">Attach Images (optional):</label>
          <ImageUploader onUploadComplete={(url) => setFile(url)} />
        </div>

        {/* Schedule */}
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

        {/* Send */}
        <div className="d-grid">
          <button className="btn btn-danger btn-lg" onClick={sendMessage}>
            Send
          </button>
        </div>

        {/* ---- ALL CONTACT NAMES AT THE VERY BOTTOM ---- */}
        <div className="mt-4 border rounded p-2 ">
          <strong>Contacts</strong>
          {loadingContacts ? (
            <div className="d-flex justify-content-center py-4">
              <div className="spinner-border text-warning" role="status" aria-label="Loading contacts">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {filteredContacts.length === 0 && (
                <div className="text-muted small mt-2">No contacts to display.</div>
              )}
              <div className="mt-2">
                <div className="container">
                  <div className="row">
                    {filteredContacts.map((c) => {
                      const full =
                        `${c.first_name || ""} ${c.last_name || ""}`.trim() || "(Unnamed)";
                      const safeKey = `c_${String(c.id)}`;
                      return (
                        <div className="col-12 col-md-6 col-lg-4 mb-2" key={safeKey}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={safeKey}
                              checked={selectedIds.has(c.id)}
                              onChange={() => toggleSelect(c.id)}
                            />
                            <label className="form-check-label" htmlFor={safeKey}>
                              {full}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
          {/* ---- END bottom names section ---- */}
        </div>
      </div>

      <p className="small mt-3">Version 2025.11.04.03</p>
    </div>
  );
}
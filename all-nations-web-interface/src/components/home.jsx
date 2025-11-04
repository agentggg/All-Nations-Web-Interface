import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>All Nations Web Interface</h1>

      <div style={styles.container}>
        <Link to="/send_by_selected_contact" style={styles.button}>
          Send by Selected Contacts
        </Link>
        <Link to="/send_all" style={styles.button}>
          Send To All Contacts
        </Link>
        <Link to="/send_by_ambassador" style={styles.button}>
          Send by Selected Ambassador Contacts
        </Link>
        <Link to="/send_by_category" style={styles.button}>
          Send by Selected Category
        </Link>
        <Link to="/send_by_outreach_contact" style={styles.button}>
          Send by Selected Outreach Contacts
        </Link>
      </div>
    </div>
  ); 
};

const styles = {
  page: {
    margin: 0,
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#000",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  title: {
    color: "#ea5a28",
    marginBottom: "30px",
    fontSize: "32px",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "90%",
    maxWidth: "400px",
  },
  button: {
    backgroundColor: "#111",
    border: "2px solid #ea5a28",
    color: "#fff",
    fontSize: "18px",
    padding: "15px",
    textAlign: "center",
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },
};

export default Home;
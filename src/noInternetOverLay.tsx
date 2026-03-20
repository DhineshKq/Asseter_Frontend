import { useEffect, useState } from "react";

function NoInternetOverlay() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        flexDirection: "column",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      {/* <img
        src={"/no-internet.png"}
        alt="No Internet"
        style={{
          width: "250px",
          marginBottom: "20px",
        }}
      /> */}
      <h1 style={{ fontSize: "2rem", color: "#f74444ff", marginBottom: "10px" }}>
        No Internet Connection
      </h1>
      <p style={{ fontSize: "1rem", color: "#666", maxWidth: "300px" }}>
        Please check your network and try again.
      </p>
      {/* <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "1rem",
          border: "none",
          borderRadius: "5px",
          backgroundColor: "#007bff",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        Retry
      </button> */}
    </div>
  );
}

export default NoInternetOverlay;
 
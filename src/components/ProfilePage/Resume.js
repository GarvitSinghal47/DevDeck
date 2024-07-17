import { Button } from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";

export default function Resume({ userid }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.0);


   useEffect(() => {
     const fetchUser = async () => {
       const userRef = ref(db, `users/${userid}`);
       const userSnapshot = await get(userRef);
       if (userSnapshot.exists()) {
         setUser(userSnapshot.val());
       } else {
         console.error("No such user!");
       }
       setLoading(false);
     };

     fetchUser();
   }, [userid]);

   if (loading) return <div>Loading...</div>;
   if (!user) return <div>User not found</div>;

  const iframeStyle = {
    width: `${scale * 100}%`,
    height: "600px",
    border: "none",
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Resume</h2>
      {user.resumeUrl ? (
        <>
          <div style={{ marginBottom: "10px" }}>
            <Button
              onClick={() => setScale(scale + 0.1)}
              icon={<ZoomInOutlined />}
            >
              Zoom In
            </Button>
            <Button
              onClick={() => setScale(scale - 0.1)}
              icon={<ZoomOutOutlined />}
            >
              Zoom Out
            </Button>
          </div>
          <iframe src={user.resumeUrl} style={iframeStyle} title="Resume" />
        </>
      ) : (
        <p>Resume not available</p>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import ProfileForm from "@/components/ProfileForm";
import { Spin, Space } from "antd";

export default function Profile() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const userRef = ref(db, `users/${authUser.uid}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          setUser({ ...authUser, ...userSnapshot.val() });
        } else {
          console.error("No such user!");
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Space size="large">
          <Spin size="large" tip="Loading..." />
        </Space>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <ProfileForm user={user} />
    </div>
  );
}

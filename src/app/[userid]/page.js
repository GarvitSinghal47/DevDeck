"use client";
import Layout from "@/components/ProfilePage/Layout";

export default function PublicProfile({ params }) {
  console.log("Entire params object:", params);
  console.log("Type of params:", typeof params);
  console.log("Keys in params:", Object.keys(params));

  const userid = params.userid || params[0];
  console.log("Extracted userid:", userid);
  return <Layout userid={userid} />;
}

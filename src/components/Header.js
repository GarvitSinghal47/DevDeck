import Link from "next/link";
import { Menu } from "antd";
import { useRouter } from "next/navigation";
import { auth, logoutUser } from "@/lib/firebase";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Menu mode="horizontal">
      <Menu.Item key="home">
        <Link href="/">Home</Link>
      </Menu.Item>
      {auth.currentUser ? (
        <>
          <Menu.Item key="profile">
            <Link href="/profile">Profile</Link>
          </Menu.Item>
          <Menu.Item key="logout" onClick={handleLogout}>
            Logout
          </Menu.Item>
        </>
      ) : (
        <>
          <Menu.Item key="login">
            <Link href="/login">Login</Link>
          </Menu.Item>
          <Menu.Item key="signup">
            <Link href="/signup">Sign Up</Link>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
}

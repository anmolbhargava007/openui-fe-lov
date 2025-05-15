
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold">
            DataGPT
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  );
};

export default Header;

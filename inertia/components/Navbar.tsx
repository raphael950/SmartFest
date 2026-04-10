import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@adonisjs/inertia/react";
import "../css/components/Navbar.css";

const Navbar = () => {
  return (
    <nav className="sf-navbar">
      <div className="sf-navbar__container">
        <div className="sf-navbar__brand">
          <div className="sf-navbar__logo">
            <Zap className="sf-navbar__logo-icon" />
          </div>
          <span className="sf-navbar__title">Festival Intelligent</span>
        </div>
        <Button variant="outline" size="sm" className="sf-navbar__login-btn" asChild>
          <Link route="session.create">Se connecter</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

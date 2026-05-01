import { Link } from "@adonisjs/inertia/react";

const AuthFooter = () => {
  return (
    <footer className="sf-auth-footer">
      <div className="sf-auth-footer__container">
        <p className="sf-auth-footer__text">© 2026 SmartFest.</p>
        <Link href="#" className="sf-auth-footer__link">
            Mentions Légales
        </Link>
      </div>
    </footer>
  );
};

export default AuthFooter;

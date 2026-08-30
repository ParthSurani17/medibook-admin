import { Link } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import Button from "../components/Button";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <FaHeartbeat className="text-5xl text-primary-300 animate-pulseLine" />
      <h1 className="mt-6 text-4xl font-extrabold text-ink-900">404</h1>
      <p className="mt-2 text-ink-500">This page took a wrong turn on the way to the clinic.</p>
      <Button as={Link} to="/" className="mt-6">
        Back to Home
      </Button>
    </div>
  );
}

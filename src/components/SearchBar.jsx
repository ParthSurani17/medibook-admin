import { FaSearch } from "react-icons/fa";

export default function SearchBar({ value, onChange, placeholder = "Search doctors, specializations...", className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-full border border-ink-200 bg-white px-5 py-3 shadow-soft transition-shadow focus-within:ring-2 focus-within:ring-primary-200 ${className}`}
    >
      <FaSearch className="text-ink-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
        aria-label="Search doctors"
      />
    </div>
  );
}

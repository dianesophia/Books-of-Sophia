import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  id,
  label = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  required = true,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      {/* <label
        htmlFor={id}
        className="block text-sm font-medium text-[#62574c]"
      >
       // {label}
      </label> */}

      <div className="relative">
        <input
          id={id}
          placeholder={label}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          className="w-full rounded-xl border border-[#e5d9c8] bg-[#fffdf9] px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#899878] focus:ring-2 focus:ring-[#899878]/20"
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887b6e] hover:text-[#56674c]"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
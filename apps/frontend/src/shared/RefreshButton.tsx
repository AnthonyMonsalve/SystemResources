import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type RefreshButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  title?: string;
};

export function RefreshButton({
  onClick,
  disabled,
  className,
  ariaLabel = "Actualizar",
  title = "Actualizar",
}: RefreshButtonProps) {
  const [spinKey, setSpinKey] = useState(0);

  const handleClick = () => {
    if (disabled) return;
    setSpinKey((prev) => prev + 1);
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
    >
      <span key={spinKey} className="refresh-spin">
        <FontAwesomeIcon icon="rotate-right" />
      </span>
    </button>
  );
}

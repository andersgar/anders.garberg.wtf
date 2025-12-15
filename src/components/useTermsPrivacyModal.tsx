import { useState } from "react";
import { TermsPrivacyModal } from "./TermsPrivacyModal";

export function useTermsPrivacyModal(mdPath = "/terms-privacy.md") {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const modal = (
    <TermsPrivacyModal isOpen={isOpen} onClose={close} mdPath={mdPath} />
  );

  return { isOpen, open, close, modal };
}

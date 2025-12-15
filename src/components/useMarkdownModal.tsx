import { useState } from "react";
import { MarkdownModal } from "./MarkdownModal";

export function useMarkdownModal(mdPath: string, title: string) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const modal = (
    <MarkdownModal isOpen={isOpen} onClose={close} mdPath={mdPath} title={title} />
  );

  return { isOpen, open, close, modal };
}

import { useEffect, useRef, useState } from "react";

export function useMarkdownFile(path: string, shouldLoad: boolean) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedPathRef = useRef<string | null>(null);

  useEffect(() => {
    loadedPathRef.current = null;
    setContent("");
    setError(null);
  }, [path]);

  useEffect(() => {
    if (!shouldLoad) return;
    if (loadedPathRef.current === path) return;

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(path)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load markdown");
        }
        return res.text();
      })
      .then((text) => {
        if (isCancelled) return;
        loadedPathRef.current = path;
        setContent(text);
      })
      .catch(() => {
        if (isCancelled) return;
        setError("Could not load content.");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [path, shouldLoad]);

  return { content, isLoading, error };
}

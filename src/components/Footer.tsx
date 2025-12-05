export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <p className="small">© {currentYear} Anders Garberg</p>
        <p className="small">Trondheim, Norge</p>
      </div>
    </footer>
  );
}

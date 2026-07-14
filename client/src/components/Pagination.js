"use client"

import PropTypes from "prop-types"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        start = 2
        end = 4
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 3
        end = totalPages - 1
      }

      if (start > 2) {
        pages.push("...")
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages - 1) {
        pages.push("...")
      }

      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.button,
          opacity: currentPage <= 1 ? 0.4 : 1,
          cursor: currentPage <= 1 ? "default" : "pointer",
        }}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      <div style={styles.pages}>
        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} style={styles.ellipsis}>
              ...
            </span>
          ) : (
            <button
              key={page}
              style={{
                ...styles.pageButton,
                ...(page === currentPage ? styles.activePage : {}),
              }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        style={{
          ...styles.button,
          opacity: currentPage >= totalPages ? 0.4 : 1,
          cursor: currentPage >= totalPages ? "default" : "pointer",
        }}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "16px 0",
    flexWrap: "wrap",
  },
  button: {
    padding: "8px 16px",
    border: "1px solid var(--color-border, #e0e7de)",
    borderRadius: 8,
    background: "var(--color-surface, #fff)",
    color: "var(--color-text, #1c271f)",
    fontSize: 14,
    fontWeight: 500,
    transition: "background 0.2s, border-color 0.2s",
    whiteSpace: "nowrap",
  },
  pages: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  pageButton: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid var(--color-border, #e0e7de)",
    borderRadius: 8,
    background: "var(--color-surface, #fff)",
    color: "var(--color-text, #1c271f)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s, color 0.2s",
  },
  activePage: {
    background: "#2d6a4f",
    color: "#fff",
    borderColor: "#2d6a4f",
    fontWeight: 600,
  },
  ellipsis: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-text-muted, #5a6c5e)",
    fontSize: 14,
  },
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
}

export default Pagination

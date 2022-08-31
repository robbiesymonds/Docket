export const downloadDocketPDF = async (res: Response): Promise<void> => {
  const blob = await res.blob()
  const pdf = new Blob([blob], { type: "application/pdf" })
  const a = document.createElement("a")

  a.download = res.headers.get("Content-Disposition") ?? "blank.pdf"
  a.href = window.URL.createObjectURL(pdf)
  a.click()

  setTimeout(() => {
    window.URL.revokeObjectURL(a.href)
  }, 150)
}

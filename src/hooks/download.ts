export const downloadDocketPDF = async (res: Response): Promise<void> => {
  // It is necessary to create a new blob object with mime-type explicitly set for all browsers except Chrome, but it works for Chrome too.
  const blob = await res.blob()
  const newBlob = new Blob([blob], { type: "application/pdf" })

  // Create a link pointing to the ObjectURL containing the blob.
  let link = document.createElement("a")
  link.download = res.headers.get("Content-Disposition") ?? "blank.pdf"
  link.href = window.URL.createObjectURL(newBlob)
  link.click()

  // For Firefox it is necessary to delay revoking the ObjectURL.
  setTimeout(() => {
    window.URL.revokeObjectURL(link.href)
  }, 250)
}

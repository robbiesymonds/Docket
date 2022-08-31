import dayjs from "dayjs"

type PdfOptions = Partial<{ scale: number; filename: string }>

class DocketTemplate {
  html: string
  filename: string
  scale: number

  constructor(template: string, options: PdfOptions) {
    this.scale = options?.scale ?? 1
    const s = (n: number) => `${n * (1 + (1 - this.scale))}px`
    const styles = `html,body{margin:0;padding:0;width:${s(793)};height:${s(1120)};position:relative;}`
    this.html = `<html><body><style>${styles}</style>${template}</body></html>`
    this.filename = options?.filename ?? `${dayjs().format("YYYY-MM-DD")}.pdf`
  }
}

export const createDocketTemplate = (s: string, options?: PdfOptions) => {
  const pdf = new DocketTemplate(s, options)
  return pdf
}

import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import puppeteer from "puppeteer"
import { calculateTotal } from "./hooks/currency"
import { DocketInvoice } from "./types"

const TEXT = ["id", "date", "client.name", "client.address"]
const BILL = ["title", "description", "hours", "rate", "utils.subtotal"]
const UTILS = ["utils.total"]

class DocketPDF {
  private template: string
  filename: string

  constructor(template: string) {
    this.template = template
    this.filename = "blank.pdf"
  }

  setContent(
    d: DocketInvoice,
    options?: Partial<{
      dateFormat: string
      customFields: Record<string, string | number>
    }>
  ): void {
    dayjs.extend(advancedFormat)
    this.filename = `${dayjs(d.date).format("YYYY-MM-DD")}.pdf`

    // Base values.
    for (const f of TEXT) {
      let value = f.split(".").reduce((o, i) => o[i], d)
      if (f === "date") value = dayjs(d.date).format(options?.dateFormat ?? "YYYY[-]MM[-]DD")
      this.template = this.template.replace(`{{${f}}}`, value.toString())
    }

    // Map through billable objects.
    let html = ""
    const start = this.template.indexOf("<!--BILLABLE-->") + 15
    const end = this.template.lastIndexOf("<!--BILLABLE-->")
    const bill_template = this.template.substring(start, end).trim()
    for (const b of d.billables) {
      let bill = bill_template
      for (const f of BILL) {
        let value: string | number
        if (f === "utils.subtotal") {
          value = b.rate * b.hours
        } else {
          value = f.split(".").reduce((o, i) => o[i], b)
        }
        bill = bill.replace(`{{${f}}}`, value.toString())
      }
      html += bill
    }
    const t = this.template
    this.template = t.slice(0, start) + html + t.slice(end, t.length - 1)

    // Utility values.
    for (const f of UTILS) {
      let value: string | number = ""
      if (f === "utils.total") {
        value = calculateTotal(d)
      }
      this.template = this.template.replace(`{{${f}}}`, value.toString())
    }

    // Custom fields
    if (options?.customFields) {
      for (const f of Object.entries(options.customFields)) {
        this.template = this.template.replace(`{{custom.${f[0]}}}`, f[1].toString())
      }
    }
  }

  async generate(): Promise<Buffer> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    page.setContent(this.template, { waitUntil: "domcontentloaded" })
    await page.emulateMediaType("screen")
    const pdf = await page.pdf({
      printBackground: true,
      format: "A4"
    })

    await browser.close()
    return pdf
  }
}

export const createDocketPDF = (s: string) => {
  const pdf = new DocketPDF(s)
  return pdf
}

import { createDocketTemplate, DocketInvoice, DocketUtils } from "docket-react"
import { NextApiRequest, NextApiResponse } from "next"
import puppeteer from "puppeteer"

// prettier-ignore
const useTemplate = (d: DocketInvoice) => `
    <code>Docket Invoice Solutions</code>
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1>#${d.id}</h1>
            <h2>${DocketUtils.format(d.date, "YYYY-MM-DD")}</h2>
        </div>
        <div style="text-align: right">
            <h1>${d.client.name}</h1>
            <h3>{${d.client.address}</h3>
        </div>
    </div>
    <hr />
    <table style="width: 100%" border="1px">
        <thead>
            <tr>
                <th>Task</th>
                <th>Rate</th>
                <th>Hours</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
        ${d.billables.map(b => `
            <tr>
                <td>
                    <h3>${b.title}</h3>
                    <p>${b.description}</p>
                </td>
                <td>${b.rate}</td>
                <td>${b.hours}</td>
                <td>${DocketUtils.subtotal(b)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    </div>
    <div style="position: absolute; bottom: 0; right: 16px;">
        <h1>Total: \$${DocketUtils.total(d)}</h1>
    </div>
`

export default async function download(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data: DocketInvoice = req.body
    const template = createDocketTemplate(useTemplate(data), { scale: 1 })

    /* This examples uses puppeteer as one example. */
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setContent(template.html, { waitUntil: "networkidle0" })
    const pdf = await page.pdf({ printBackground: true, format: "A4" })
    await browser.close()

    // Force the Content-Type and return the buffer.
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", template.filename)
    return res.status(200).send(pdf)
    // Something went wrong!
  } catch (e) {
    console.log(e)
    return res.status(400).end()
  }
}

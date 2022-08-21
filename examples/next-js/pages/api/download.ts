import { NextApiRequest, NextApiResponse } from "next"
import { DocketInvoice } from "docket-react"
import { createDocketPDF } from "docket-react/server"

export default async function download(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data: DocketInvoice = req.body

    // HTML would most likely be read from file.
    const pdf = createDocketPDF(`
    <html style="margin: 0; padding: 0;">
      <body>
        <code>Docket Invoice Solutions</code>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1>#{{id}}</h1>
            <h2>{{date}}</h2>
          </div>
          <div style="text-align: right">
            <h1>{{client.name}}</h1>
            <h3>{{client.address}}</h3>
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
          <!--BILLABLE-->
          <tr>
            <td>
              <h3>{{title}}</h3>
              <p>{{description}}</p>
            </td>
            <td>{{rate}}</td>
            <td>{{hours}}</td>
            <td>{{utils.subtotal}}</td>
          </tr>
          <!--BILLABLE-->
        </div>
        <div style="position: absolute; bottom: 0; right: 16px;">
          <h1>Total: \${{utils.total}}</h1>
          <p>Tax: {{custom.tax}}</p>
        </div>
      </body>
    </html>
  `)

    pdf.setContent(data, {
      dateFormat: "Do MMMM[, ]YYYY",
      customFields: {
        tax: 100
      }
    })

    const buffer = await pdf.generate()

    // Force the Content-Type and return the buffer.
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", pdf.filename)
    return res.status(200).send(buffer)

    // Something went wrong!
  } catch (e) {
    console.log(e)
    return res.status(400).end()
  }
}

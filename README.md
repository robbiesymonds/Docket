# Docket

![Verison](https://img.shields.io/npm/v/docket-react)
![Size](https://img.shields.io/bundlephobia/minzip/docket-react)
![License](https://img.shields.io/npm/l/docket-react)

Drop-in invoice management system built for React.

![Cover Photo](https://raw.githubusercontent.com/robbiesymonds/Docket/master/snapshot.png)

## 🚀 Getting Started
Docket provides a single React component for you to use however you want. This component exposes a number of [properties](#⚙️-configuration) to hook in with whatever backend/framework you are using. Docket is designed to be as unopinionated as possible, so data storage and fetching is left up to you.

Docket also implements a simple `HTML` templating system for creating your own invoice templates that could be populated and converted to `PDF` for download from the front-end. [Scroll down](#invoice-generation) for information.

### Installation
```bash
# With yarn
yarn add docket-react

# With npm
npm install docket-react --save
```

## 💾 Usage
See the [NextJS example](https://github.com/robbiesymonds/Docket/tree/main/examples/next-js) for a more detailed picture of how Docket can be implemented.
### React Component
```jsx
import { Docket, DocketInvoice, downloadDocketPDF } from "docket-react"

/*
  Sends the selected docket to API for conversion. 
  See the next example for how you might handle this API route.
*/
const handleDownload = async (d: DocketInvoice) => {
  await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d)
  }).then(downloadDocketPDF)
}

/* For update, deletion, and creation it's up to you how you want to handle this! */
const handleGeneric = async (d: DocketInvoice) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 1000))
  console.log(d)
}

/* This would either be fetched client-side or via SSR */
const DATA: DocketInvoice[] = [...]


const Component = () => {
  return (
    <Docket
      data={DATA}
      theme="light"
      onDownload={handleDownload}
      onCreate={handleGeneric}
      onUpdate={handleGeneric}
      onDelete={handleGeneric}
    />
  )
}
```


### Invoice Generation
The conversion of an `HTML` template to an accessiblity-friendly (non-screenshot) `PDF` is powered by Puppeteer and therefore cannot be done client-side. Below is an example of an API route you might use to implement this feature:
```jsx
import { createDocketTemplate, DocketInvoice, DocketUtils } from "docket-react"
import { NextApiRequest, NextApiResponse } from "next"
import puppeteer from "puppeteer"

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
}
```

## ⚙️ Configuration
The table below describes the available parameters of the React component:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| data | `Array<DocketInvoice>` | `null`|Passes the Docket component the array of invoice items to render on the screen. Loading state will be shown if value is `null`.
| theme| `"light" \| "dark"`| `auto` | Specifies which styles to apply the Docket theme. If not specified then `prefers-color-scheme` media will be used.
| primaryColor | `string` | `blue` | Controls the highlight colour used across Docket theme.
| onDownload | `(d: DocketInvoice) => Promise<void>` | `undefined` | Callback that is used when the download button is pressed.
| onCreate | `(d: DocketInvoice) => Promise<void>` | `undefined` | Called when a new invoice is created.
| onUpdate | `(d: DocketInvoice) => Promise<void>` | `undefined` | Called when an existing invoice is changed.
| onDelete | `(d: DocketInvoice) => Promise<void>` | `undefined` | Callback that is used when an invoice is deleted.

### Invoice Templates
Any `HTML` string can be passed to the `createDocketTemplate()` function and it will be wrapped within some utility styles to adjustment your template best for PDF. To insert values into a template, simply use vanilla JS string templates specifying them using `${obj.value}` notation.

**Billables:**
Since the `billables` array can be of varying length, templating cannot just be simple value replacement, instead you can use `.map().join("")` approach to dynamically create `HTML` within your template before passing it to Docket.

**Additional Options:** the `createDocketPDF()` also excepts a second parameter to specify additional information:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| filename | `string` | `YYYY-MM-DD.pdf`| Determines the value of the filename that will be associated with the returned `DocketTemplate`.
| scale| `number` | `1`| Specify a pre-processing transform on the template to easily adjust for various document sizes.

## 💀 Additional Information

### NextJS Compatability
Since Docket uses [Emotion](https://emotion.sh/) under the hood for styling, you can take advantage of the `@emotion/server` dependency to generate the styles on the server before the request is fulfilled, preventing any FOUC during rendering. Simply add the following to your `_document.tsx` file:
```jsx
import Document, { Head, Html, Main, NextScript } from "next/document"
import { createDocketInitialProps } from "docket-react"

const getInitialProps = createDocketInitialProps()

export default class _Document extends Document {
  static getInitialProps = getInitialProps

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
```

### Authentication
>Docket does not currently implement any protection methods (like a password), so please keep this in mind if you intend to deploy your instance to a publicly accessible URL.
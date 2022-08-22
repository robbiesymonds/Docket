# Docket

![Verison](https://img.shields.io/npm/v/docket-react)
![Size](https://img.shields.io/bundlephobia/minzip/docket-react)
![License](https://img.shields.io/npm/l/docket-react)

Drop-in invoice management system built for React.

![Cover Photo](https://raw.githubusercontent.com/robbiesymonds/Docket/master/snapshot.png)

## 🚀 Getting Started
Docket provides a single React component for you to use however you want. This component exposes a number of [properties](#⚙️-configuration) to hook in with whatever backend/framework you are using. Docket is designed to be as unopinionated as possible, so data storage and fetching is left up to you.

Docket also implements a simple `HTML` templating system for creating your own invoice templates that can be populated and converted to `PDF` on the server for download from the front-end. [Scroll down](#invoice-generation) for information.

### [Installation](https://www.npmjs.com/package/docket-react)
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
```js
/*
  Note: `moduleResolution` must be set to "NodeNext" for this import to work,
  otherwise it must be imported from "docket-react/dist/cjs/server"
*/ 
import { createDocketPDF } from "docket-react/server"

async function download(req: Request, res: Response) {
  const data: DocketInvoice = req.body
  
  /* This template string would realistically be read from a file. */
  const pdf = createDocketPDF(`
    <html style="margin: 0; padding: 0;">
      <body>
      ...
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

  /* Enforce the Content-Type and return the buffer. */
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", pdf.filename)
  return res.status(200).send(buffer)
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
Any `HTML` string can be passed to the `createDocketPDF()` function and it will be rendered using the `screen` media type, this means that all styles are respected, but still cannot be a reference to an external file. To insert values into a template, specify them using `{{obj.value}}` notation (e.g to insert the client address value into your template you would use `{{client.address}}`).

**Billables:**
Since the `billables` array can be of varying length, templating cannot just be simple value replacement, instead the `HTML` for one billable is defined by wrapping the `HTML` with `<!--BILLABLE-->` on either side of the block. The values each billable are then mapped and inserted, hence inside your billable template you only need to reference `{{hours}}` instead of `{{billables[i].hours}}`.

**Additional Options:** the `setContent()` also excepts a second parameter to specify additional information:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| dateFormat | `string` | `YYYY-MM-DD`|Uses the [dayjs] advanced date formatting syntax to manipulate the display of the invoice date output.
| customFields| `Record<string, string\| number>` | `undefined`|Allows any number of additional values to be parsed and inserted in the invoice template.


## 💀 Additional Information
>Docket does not currently implement any protection methods (like a password), so please keep this in mind if you intend to deploy your instance to a publicly accessible URL.
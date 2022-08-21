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

import { createGetInitialProps } from "@mantine/next"
import { Docket } from "./components/Docket"
import { DocketInvoice } from "./types"
import { downloadDocketPDF } from "./hooks/download"

const createDocketInitialProps = createGetInitialProps

export type { DocketInvoice }
export { Docket, createDocketInitialProps, downloadDocketPDF }

import { Docket } from "./components/Docket"
import { createGetInitialProps } from "@mantine/next"
import { createDocketTemplate } from "./hooks/template"
import { downloadDocketPDF } from "./hooks/download"
import { DocketUtils } from "./hooks/utils"
import { DocketInvoice } from "./types"

const createDocketInitialProps = createGetInitialProps

export type { DocketInvoice }
export { Docket, DocketUtils, createDocketInitialProps, createDocketTemplate, downloadDocketPDF }

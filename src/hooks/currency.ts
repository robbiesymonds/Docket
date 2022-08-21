import { DocketInvoice } from "../types"

export const formatCurrency = (d: number | string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(typeof d === "string" ? parseInt(d) : d)
}

export const calculateTotal = (d: DocketInvoice) => {
  return d.billables.reduce((a, b) => a + b.hours * b.rate, 0)
}

export const formatTotal = (d: DocketInvoice) => {
  return formatCurrency(calculateTotal(d))
}

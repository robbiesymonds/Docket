import dayjs from "dayjs"
import { Billable, DocketInvoice } from "src/types"
import advancedFormat from "dayjs/plugin/advancedFormat"

export const DocketUtils = {
  subtotal: (b: Billable): number => b.hours * b.rate,
  total: (d: DocketInvoice): number => d.billables.reduce((a, b) => a + b.hours * b.rate, 0),
  format: (d: Date | string, format: string): string => {
    dayjs.extend(advancedFormat)
    return dayjs(d).format(format)
  }
}

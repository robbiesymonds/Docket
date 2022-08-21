import dayjs from "dayjs"
import { DocketInvoice } from "../types"
import { calculateTotal, formatCurrency } from "./currency"

export const useStatistics = (data: DocketInvoice[]) => {
  let state = { year: 0, month: 0 }

  data?.forEach((d) => {
    if (dayjs().isSame(d.date, "year")) {
      const total = calculateTotal(d)
      if (dayjs().isSame(d.date, "month")) state.month += total
      state.year += total
    }
  })

  return {
    year: formatCurrency(state.year),
    month: formatCurrency(state.month)
  }
}

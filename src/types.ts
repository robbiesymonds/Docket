export interface Billable {
  title: string
  description: string
  hours: number
  rate: number
}

export interface DocketInvoice {
  id: number
  date: Date | string
  client: {
    name: string
    address: string
  }
  billables: Billable[]
}

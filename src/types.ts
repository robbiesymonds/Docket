export interface DocketInvoice {
  id: number | string
  date: Date | string
  client: {
    name: string
    address: string
  }
  billables: {
    title: string
    description: string
    hours: number | string
    rate: number | string
  }[]
}

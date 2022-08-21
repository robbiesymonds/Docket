export interface DocketInvoice {
  id: number
  date: Date | string
  client: {
    name: string
    address: string
  }
  billables: {
    title: string
    description: string
    hours: number
    rate: number
  }[]
}

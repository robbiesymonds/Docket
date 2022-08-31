import { Docket, DocketInvoice, downloadDocketPDF } from "docket-react"

const TEMP_DATA: DocketInvoice[] = [
  {
    id: 49,
    date: new Date(),
    client: {
      name: "Bloom Co",
      address: "1 Mountain Avenue"
    },
    billables: [
      {
        title: "I did something!",
        description: "This is a description",
        hours: 40,
        rate: 65
      }
    ]
  },
  {
    id: 48,
    date: new Date("2022-06-05"),
    client: {
      name: "Digital Pty Ltd",
      address: "12 Baker Street"
    },
    billables: [
      {
        title: "Software Development",
        description: "Payment amount as per contract.",
        hours: 45,
        rate: 75
      }
    ]
  }
]

export default function Home() {
  /* Converts selected invoice into PDF on the client! */
  const handleDownload = async (d: DocketInvoice) => {
    await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    }).then(downloadDocketPDF)
  }

  /* For update, deletion, and creation it's up to you how you want to handle this! */
  const handleGeneric = async (d: DocketInvoice) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
    console.log(d)
  }

  // Create the DOM.
  return (
    <div
      style={{
        padding: 16,
        margin: "auto",
        maxWidth: 1280,
        paddingTop: "clamp(16px, 3vw, 48px)"
      }}
    >
      <Docket
        theme="light"
        data={TEMP_DATA}
        onDownload={handleDownload}
        onCreate={handleGeneric}
        onUpdate={handleGeneric}
        onDelete={handleGeneric}
      />
    </div>
  )
}

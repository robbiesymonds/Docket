import React from "react"
import {
  ActionIcon,
  Button,
  Center,
  Container,
  createStyles,
  Global,
  Group,
  Loader,
  MantineColor,
  MantineProvider,
  Modal,
  NumberInput,
  Paper,
  Space,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core"
import { DatePicker } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { useColorScheme } from "@mantine/hooks"
import { IconAdjustmentsHorizontal, IconDownload, IconPlus, IconTrash } from "@tabler/icons"
import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import { useEffect, useMemo, useState } from "react"
import { formatTotal } from "../hooks/currency"
import { useStatistics } from "../hooks/statistics"
import { DocketInvoice } from "../types"

type DocketCb = (d: DocketInvoice) => Promise<void>

interface DocketOptions {
  theme?: "light" | "dark"
  data: DocketInvoice[]
  primaryColor?: MantineColor
  onDownload?: DocketCb
  onCreate?: DocketCb
  onUpdate?: DocketCb
  onDelete?: DocketCb
}

export const Docket = (options: DocketOptions) => {
  const system = useColorScheme("light", { getInitialValueInEffect: true })
  const [theme, setTheme] = useState(options.theme ?? system)
  useEffect(() => setTheme(options.theme ?? system), [system, options.theme])

  return (
    <MantineProvider
      theme={{
        colorScheme: theme,
        focusRing: "never",
        headings: {
          fontWeight: 700
        },
        components: {
          Text: {
            defaultProps: {
              weight: 500,
              color: theme === "dark" ? "#FFFFFF" : "#000000"
            }
          },
          Title: {
            styles: (theme) => ({
              root: {
                color: theme.colorScheme === "dark" ? theme.white : theme.black,
                letterSpacing: "-0.04em"
              }
            })
          },
          Paper: {
            styles: (theme) => ({
              root: {
                backgroundColor: "transparent",
                borderColor: theme.colorScheme === "dark" ? theme.colors.gray[9] : theme.colors.gray[2]
              }
            })
          },
          Modal: {
            styles: {
              close: {
                marginTop: -16
              }
            }
          },
          Button: {
            styles: (theme) => ({
              root: {
                backgroundColor:
                  theme.colorScheme === "dark" ? theme.white : theme.colors[options.primaryColor ?? "blue"][6],
                color: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.white,
                ":hover": {
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.gray[3]
                      : theme.colors[options.primaryColor ?? "blue"][5]
                }
              }
            })
          },
          Loader: {
            defaultProps: {
              color: options.primaryColor ?? "blue"
            }
          }
        }
      }}
      withNormalizeCSS
      withGlobalStyles
    >
      <Global
        styles={(theme) => ({
          body: {
            ...theme.fn.fontStyles(),
            backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white,
            color: theme.colorScheme === "dark" ? theme.white : theme.black
          }
        })}
      />
      <DocketContainer
        {...options}
        data={options.data ? options.data.map((d) => ({ ...d, date: dayjs(d.date).toDate() })) : null}
      />
    </MantineProvider>
  )
}

const blankInvoice: DocketInvoice = {
  id: 0,
  date: new Date(),
  client: {
    name: "",
    address: ""
  },
  billables: [{ title: "", description: "", hours: 0, rate: 0 }]
}

export const DocketContainer = ({ data, onDownload, onCreate, onUpdate, onDelete }: DocketOptions) => {
  const { classes } = useStyles()
  const [newModal, setNewModal] = useState<boolean>(false)
  const [updateModal, setUpdateModal] = useState<boolean>(false)
  const [selectedValues, setSelectedValues] = useState<DocketInvoice>(blankInvoice)
  const [newValues, setNewValues] = useState<DocketInvoice>(blankInvoice)
  const [downloading, setDownloading] = useState<null | number>(null)

  const [currentData, setData] = useState<DocketInvoice[]>(data)
  useEffect(() => setData(data), [data])

  const summary = useMemo(() => useStatistics(currentData), [currentData])
  dayjs.extend(advancedFormat)

  return (
    <>
      <Modal
        title={<Title order={3}>New Invoice</Title>}
        centered
        size="xl"
        opened={newModal}
        closeOnClickOutside
        overflow="outside"
        onClose={() => setNewModal(false)}
      >
        <Form
          buttonLabel="Create"
          initialValue={newValues}
          onSubmit={async (d) => {
            if (onCreate) await onCreate(d)
            setNewModal(false)
            setData((data) => [d, ...data])
          }}
        />
      </Modal>
      <Modal
        title={<Title order={3}>Update Invoice</Title>}
        centered
        size="xl"
        opened={updateModal}
        closeOnClickOutside
        overflow="outside"
        onClose={() => setUpdateModal(false)}
      >
        <Form
          showDelete
          buttonLabel="Update"
          initialValue={selectedValues as DocketInvoice}
          onDelete={async (d) => {
            if (onDelete) await onDelete(d)
            setUpdateModal(false)
            setData((data) => data.filter((a) => a.id !== d.id))
          }}
          onSubmit={async (d) => {
            if (onUpdate) await onUpdate(d)
            setUpdateModal(false)
            setData((data) => data.map((a, i) => (i === currentData.indexOf(selectedValues) ? d : a)))
          }}
        />
      </Modal>
      <Container p={0} fluid>
        <Group position="apart">
          <Title order={2} style={{ fontWeight: 600 }}>
            Invoices
          </Title>
          <ActionIcon
            variant="light"
            onClick={() => {
              setNewValues(blankInvoice)
              setNewModal(true)
            }}
          >
            <IconPlus size={18} />
          </ActionIcon>
        </Group>
        <Space h="sm" />
        <Paper withBorder p={16}>
          <Group position="apart" grow py={8} className={classes.stats}>
            <div className={classes.info}>
              <Text color="dimmed">This Year</Text>
              <Title order={1} style={{ opacity: currentData ? 1 : 0.25 }}>
                {summary.year}
              </Title>
            </div>
            <div className={classes.info}>
              <Text color="dimmed">This Month</Text>
              <Title order={1} style={{ opacity: currentData ? 1 : 0.25 }}>
                {summary.month}
              </Title>
            </div>
            <div className={classes.info}>
              <Text color="dimmed">Smart Docket</Text>
              <Button
                disabled={currentData?.length === 0}
                onClick={() => {
                  setNewValues({
                    id: currentData ? (currentData[0].id as number) + 1 : 0,
                    date: new Date(),
                    client: currentData[0].client,
                    billables: currentData[0].billables
                  })
                  setNewModal(true)
                }}
              >
                Generate
              </Button>
            </div>
          </Group>
        </Paper>
        <Space h="lg" />
        <Paper withBorder p={0}>
          {currentData !== null ? (
            currentData?.map((d) => (
              <div className={classes.item} key={d.id}>
                <Group position="apart">
                  <Title order={3}>
                    <span>{`#${String(d.id).padStart(3, "0")}`}</span>
                    {d.client.name}
                  </Title>
                  <div>
                    <div>
                      <Text color="dimmed">{formatTotal(d)}</Text>
                    </div>
                    <div className={classes.date}>
                      <Text>
                        <span>{dayjs(d.date).format("Do MMMM[,]")}</span>
                        {dayjs(d.date).format("[ ]YYYY")}
                      </Text>
                    </div>
                    <div>
                      <ActionIcon
                        variant="light"
                        onClick={() => {
                          setSelectedValues(d)
                          setUpdateModal(true)
                        }}
                      >
                        <IconAdjustmentsHorizontal size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        loading={downloading === d.id}
                        disabled={!onDownload}
                        onClick={async () => {
                          setDownloading(d.id as number)
                          if (onDownload) await onDownload(d)
                          setDownloading(null)
                        }}
                      >
                        <IconDownload size={18} />
                      </ActionIcon>
                    </div>
                  </div>
                </Group>
              </div>
            ))
          ) : (
            <Center p={64}>
              <Loader />
            </Center>
          )}
        </Paper>
      </Container>
    </>
  )
}

interface FormProps {
  buttonLabel: string
  initialValue: DocketInvoice
  showDelete?: boolean
  onDelete?: (d: DocketInvoice) => Promise<void>
  onSubmit?: (d: DocketInvoice) => Promise<void>
}

const Form = (props: FormProps) => {
  const { classes } = useStyles()
  const [loading, setLoading] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)

  const form = useForm<DocketInvoice>({
    initialValues: props.initialValue
  })

  return (
    <form
      onSubmit={form.onSubmit(async (v) => {
        setLoading(true)
        if (props.onSubmit) await props.onSubmit(v)
        setLoading(false)
      })}
    >
      <Stack>
        <Group grow style={{ maxWidth: 450 }}>
          <NumberInput required min={0} placeholder="Invoice #" {...form.getInputProps("id")} />
          <DatePicker required placeholder="Date" {...form.getInputProps("date")} />
        </Group>
        <TextInput required placeholder="Client" {...form.getInputProps("client.name")} style={{ maxWidth: 550 }} />
        <TextInput
          required
          placeholder="Client Address"
          {...form.getInputProps("client.address")}
          style={{ maxWidth: 550 }}
        />
        <Paper className={classes.tasks} withBorder radius="md">
          {form.values.billables.map((_, i) => (
            <Stack key={i} className={classes.task}>
              <TextInput required placeholder="Task Name" {...form.getInputProps(`billables.${i}.title`)} />
              <TextInput required placeholder="Description" {...form.getInputProps(`billables.${i}.description`)} />
              <Group>
                <NumberInput min={0} required placeholder="Hours" {...form.getInputProps(`billables.${i}.hours`)} />
                <NumberInput min={0} required placeholder="Rate" {...form.getInputProps(`billables.${i}.rate`)} />
              </Group>
              {i > 0 && (
                <ActionIcon
                  size="lg"
                  color="red"
                  variant="outline"
                  className={classes.delete}
                  onClick={() => form.removeListItem("billables", i)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              )}
            </Stack>
          ))}
        </Paper>
        <Group position="right">
          <ActionIcon
            variant="light"
            onClick={() =>
              form.insertListItem("billables", {
                title: "",
                description: "",
                hours: "",
                rate: ""
              })
            }
          >
            <IconPlus size={18} />
          </ActionIcon>
        </Group>
      </Stack>
      <Space h="xl" />
      <Group position="right">
        {props.showDelete && (
          <ActionIcon
            size="lg"
            color="red"
            variant="light"
            loading={deleting}
            onClick={async () => {
              setDeleting(true)
              if (props.onDelete) await props.onDelete(props.initialValue as DocketInvoice)
              setDeleting(false)
            }}
          >
            <IconTrash size={18} />
          </ActionIcon>
        )}
        <Button type="submit" loading={loading}>
          {props.buttonLabel}
        </Button>
      </Group>
    </form>
  )
}

const useStyles = createStyles((theme) => ({
  stats: {
    [theme.fn.smallerThan(theme.breakpoints.sm)]: {
      flexDirection: "column"
    }
  },
  info: {
    textAlign: "center",
    padding: "8px 0",
    borderRight: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]}`,
    "& > h1": {
      marginTop: -5
    },
    "& > button": {
      marginTop: 3
    },
    ":last-of-type": {
      border: "none"
    },
    [theme.fn.smallerThan(theme.breakpoints.sm)]: {
      paddingTop: 12,
      paddingBottom: 24,
      width: "100%",
      maxWidth: "unset",
      borderRight: "none",
      borderBottom: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]}`,
      ":first-of-type": {
        paddingTop: 8
      },
      ":last-of-type": {
        paddingBottom: 8
      }
    }
  },
  item: {
    padding: 16,
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]}`,
    ":last-of-type": {
      border: "none"
    },
    "& h3 span": {
      opacity: 0.5,
      marginRight: 8
    },
    "& > div": {
      width: "100%",
      "& > div": {
        "& span": {
          minWidth: 100,
          maxWidth: 100,
          textAlign: "right",
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          verticalAlign: "bottom"
        },
        display: "flex",
        flexDirection: "row",
        "& > div": {
          display: "flex",
          flexDirection: "row",
          columnGap: 16,
          padding: "0 16px",
          borderLeft: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]}`,
          ":first-of-type": {
            border: "none"
          },
          ":last-of-type": {
            paddingRight: 0
          }
        }
      }
    }
  },
  date: {
    [theme.fn.smallerThan(theme.breakpoints.sm)]: {
      display: "none !important"
    }
  },
  tasks: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : "#f8f8f8",
    border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[3]}`
  },
  task: {
    padding: 16,
    position: "relative",
    borderBottom: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[3]}`,
    paddingBottom: 16,
    ":last-of-type": {
      border: "none"
    }
  },
  delete: {
    position: "absolute",
    right: 16,
    bottom: 16
  }
}))

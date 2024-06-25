import moment from 'moment-timezone'

export const formatCurrency = (value, { locale = 'en-US', ...options }) => {
  const defaultOptions = {
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    ...defaultOptions,
    ...options
  })

  return formatter.format(value)
}

export const getDaysBetweenDates = (startDate, endDate, timeZone) => {
  let startDay = moment(startDate * 1000).tz(timeZone)
  let endDay = moment(endDate * 1000).tz(timeZone)

  // Add day one
  let dates = [startDay.clone().unix()]

  // Add all additional days
  while (startDay.add(1, 'days').diff(endDay) < 0) {
    dates.push(startDay.clone().unix())
  }

  return dates
}

export const getFormattedDate = (datetime, timeZone) => {
  if (timeZone)
    return moment.tz(datetime * 1000, timeZone).format('MMMM DD, YYYY')

  return moment.unix(datetime).format('MMMM DD, YYYY')
}

export const getFormattedTime = (datetime, timeZone = false) => {
  if (timeZone) {
    return moment.tz(datetime * 1000, timeZone).format('HH:mm')
  }

  return moment.unix(datetime).format('HH:mm')
}

export const getSummitFormattedDate = (summit) => {
  if (!summit) return null

  let dateRange = getDaysBetweenDates(
    summit.start_date,
    summit.end_date,
    summit.time_zone_id
  )

  if (dateRange.length > 1) {
    let startDate = getFormattedDate(dateRange[0], summit.time_zone_id)
    let endDate = getFormattedDate(
      dateRange[dateRange.length - 1],
      summit.time_zone_id
    )

    const startMonth = startDate.split(' ')[0]
    const endMonth = endDate.split(' ')[0]

    if (startMonth === endMonth)
      endDate = endDate.substr(endDate.indexOf(' ') + 1)

    const startYear = startDate.substring(
      startDate.length,
      startDate.length - 4
    )
    const endYear = endDate.substring(endDate.length, endDate.length - 4)

    if (startYear === endYear)
      startDate = startDate.substring(0, startDate.length - 6)

    endDate =
      endDate.substring(0, endDate.length - 6) +
      ', ' +
      endDate.substring(endDate.length - 4)

    return `${startDate} - ${endDate}`
  }

  return getFormattedDate(summit.start_date, summit.time_zone_id)
}

export const calculateOrderTotals = ({ order, summit, tickets }) => {
  if (!order || !summit || !tickets) return {}

  const { refunded_amount, discount_amount, taxes_amount, amount } = order
  const { ticket_types } = summit

  const ticketSummary = []
  let purchaseTicketTotal = 0

  const currencyObject = { currency: order.currency }

  Object.keys(order.tickets_excerpt_by_ticket_type).map((ticket) => {
    let ticketType = ticket_types.find((tt) => tt.name === ticket)
    ticketSummary.push({
      ticket_type_id: ticketType.id,
      ticket_type: ticketType,
      name: ticket,
      qty: order.tickets_excerpt_by_ticket_type[ticket]
    })
    purchaseTicketTotal =
      purchaseTicketTotal +
      ticketType.cost * order.tickets_excerpt_by_ticket_type[ticket]
  })

  const purchaseTotal = formatCurrency(purchaseTicketTotal, currencyObject)

  const discountTotal = formatCurrency(discount_amount, currencyObject)
  const refundTotal = formatCurrency(refunded_amount, currencyObject)
  const taxesTotal = formatCurrency(taxes_amount, currencyObject)
  const amountTotal = order.hasOwnProperty('amount')
    ? formatCurrency(amount, currencyObject)
    : formatCurrency(purchaseTotal, currencyObject)

  return { discountTotal, refundTotal, taxesTotal, amountTotal, ticketSummary }
}

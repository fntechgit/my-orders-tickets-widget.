import React from 'react'
import { useTranslation } from 'react-i18next'
import { calculateOrderTotals, formatCurrency } from '../../utils'
import { Grid, Box } from '@mui/material'
import Divider from '@mui/material/Divider'

import '../../styles/order-summary.scss'

export const OrderSummaryTable = ({ order, summit, tickets }) => {
  const { t } = useTranslation()
  const { discountTotal, refundTotal, taxesTotal, amountTotal, ticketSummary } =
    calculateOrderTotals({ order, summit, tickets })

  // console.log('OrderSummaryTable', tickets)

  return (
    <Box className='order-summary-table'>
      {ticketSummary.length > 0 && (
        <>
          {ticketSummary.map((ticket) => {
            const ticketTotal =
              (ticket.qty * (ticket.ticket_type.cost * 100)) / 100

            return (
              <Grid
                container
                key={`tixorder_${ticket.ticket_type.created}`}
                sx={{ pt: 1, pb: 1 }}
              >
                <Grid xs={6} item>
                  <span>
                    x{ticket.qty} {ticket.ticket_type.name}
                  </span>
                </Grid>
                <Grid xs={6} item align='right'>
                  {formatCurrency(ticketTotal, { currency: order.currency })}
                </Grid>
              </Grid>
            )
          })}
        </>
      )}

      {order.discount_amount > 0 && (
        <Grid container sx={{ pt: 1, pb: 1 }}>
          <Grid xs={6} item>
            {t('order_summary.discounts')}
          </Grid>
          <Grid xs={6} item align='right'>
            -{discountTotal}
          </Grid>
        </Grid>
      )}

      {order.taxes_amount > 0 && (
        <Grid container sx={{ pt: 1, pb: 1 }}>
          <Grid xs={6} item>
            {t('order_summary.taxes')}
          </Grid>
          <Grid xs={6} item align='right'>
            {taxesTotal}
          </Grid>
        </Grid>
      )}

      {order.status === 'Paid' && (
        <Grid container sx={{ pt: 1, pb: 1 }}>
          <Grid xs={6} item>
            {t('order_summary.amount_paid')}
          </Grid>
          <Grid xs={6} item align='right'>
            -{amountTotal}
          </Grid>
        </Grid>
      )}

      {refundTotal > 0 && (
        <Grid container sx={{ pt: 1, pb: 1 }}>
          <Grid xs={6} item>
            {t('order_summary.refunds')}
          </Grid>
          <Grid xs={6} item align='right'>
            {refundTotal}
          </Grid>
        </Grid>
      )}

      <Divider />

      <Grid container sx={{ pt: 2, pb: 1 }} className='order-total'>
        <Grid xs={6} item>
          {t('order_summary.total')}
        </Grid>
        <Grid xs={6} item align='right'>
          {order.status === 'Paid' ? '$0.00' : amountTotal}
        </Grid>
      </Grid>
    </Box>
  )
}

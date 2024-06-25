import React, { useState, useEffect } from 'react'
import { Grid, Box } from '@mui/material'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'react-i18next'
import { getFormattedDate } from '../../utils'
import '../../styles/order-summary.scss'
import { OrderSummaryTable } from './OrderSummaryTable'
import RefundEmailSupport from './RefundEmailSupport'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

const OrderSummary = ({ order, summit, tickets }) => {
  const { t } = useTranslation()

  // console.log('OrderSummary tickets', tickets);
  return (
    <>
      <Box className='order-summary-wrapper' sx={{ pt: 4, px: 4 }}>
        <h3>{t('order_summary.order_summary')}</h3>
        <Grid
          container
          className='order-summary-purchased-number'
          sx={{ pb: 3 }}
        >
          <Grid xs={6} item>
            <span className='order-purchased label'>
              {t('orders.purchased')}:
            </span>{' '}
            <br />
            <span>{getFormattedDate(order.created)}</span>
          </Grid>
          <Grid xs={6} item>
            <span className='order-no label'>
              {t('order_summary.order_no')}:
            </span>{' '}
            <br />
            <span className='order-order-number'>{order.number}</span>
            <ContentCopyIcon
              onClick={() => navigator.clipboard.writeText(order.number)}
            />
          </Grid>
        </Grid>
        <Divider />
        <Grid container>
          <Grid
            xs={12}
            className='order-summary-purchased-info'
            sx={{ pb: 3 }}
            item
          >
            <OrderSummaryTable
              order={order}
              summit={summit}
              tickets={tickets}
            />
          </Grid>
        </Grid>
      </Box>
      <Box className='order-summary-refund-support' xs={12} sx={{ pb: 3 }}>
        <RefundEmailSupport
          onRefundClick={() => {}}
          onEmailSupportClick={() => {}}
        />
      </Box>
      <Divider />
    </>
  )
}

export default OrderSummary

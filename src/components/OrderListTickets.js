import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Grid } from '@mui/material'
import { getTicketById } from '../actions'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

const OrderListTickets = ({ order, ticket }) => {
  const dispatch = useDispatch()
  useEffect(() => {
    // dispatch(getTicketById({order, ticket}));
  }, [])
  return (
    <Grid key={ticket.id} className='order-wrapper' container>
      <Grid xs={7} padding={2} item>
        {'General Attendee Ticket'}
      </Grid>
      <Grid xs={5} padding={2} item>
        <span className='ticket-ticket-number'>{ticket.number}</span>
        <ContentCopyIcon
          onClick={() => navigator.clipboard.writeText(order.number)}
        />
      </Grid>
      <Grid xs={4} item>
        {'column'}
      </Grid>
      <Grid xs={8} item>
        {'column'}
      </Grid>
    </Grid>
  )
}

export default OrderListTickets

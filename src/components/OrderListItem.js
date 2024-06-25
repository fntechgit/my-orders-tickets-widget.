import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getTicketsByOrder } from '../actions'
import { Grid } from '@mui/material'
import OrderListTickets from './OrderListTickets'
import '../styles/order-component.scss'

const OrderListItem = ({ order, summit, ...props }) => {
  const dispatch = useDispatch()
  const {
    orderTickets: { tickets }
  } = useSelector((state) => state)
  useEffect(() => {
    // fetchData(order.id);
  }, [order])

  const fetchData = async (orderId) => {
    await dispatch(getTicketsByOrder({ orderId }))
  }

  console.log('OrderListItem for orderID', order.id, tickets)
  return tickets.map((ticket) => (
    <OrderListTickets key={ticket.id} order={order} ticket={ticket} />
  ))
}

export default OrderListItem

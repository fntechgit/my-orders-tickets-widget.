import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import OrderListItem from './OrderListItem'
import OrderSummary from './OrderSummary/OrdersSummary'
import { Grid } from '@mui/material'
import '../styles/ticket-component.scss'

const OrdersList = (props) => {
  const { user, summit, onTicketAssigned, getAccessToken, orders, tickets } =
    props
  const {} = orders
  const dispatch = useDispatch()
  const [isInitializing, setIsInitializing] = useState(true)

  // console.log('ordersList', tickets);

  return orders?.map((order) => (
    <Grid
      key={order.id}
      container
      rowSpacing={1}
      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
    >
      <Grid
        padding={2}
        item
        lg={7}
        md={7}
        sm={12}
        xs={12}
        order={{ md: 1, lg: 1 }}
        className='ticket-list-container'
      >
        <OrderListItem order={order} {...props} />
      </Grid>
      <Grid
        padding={2}
        item
        lg={5}
        md={5}
        sm={12}
        xs={12}
        order={{ md: 1, lg: 1 }}
      >
        <OrderSummary order={order} summit={summit} tickets={tickets} />
      </Grid>
    </Grid>
  ))
}

export default OrdersList

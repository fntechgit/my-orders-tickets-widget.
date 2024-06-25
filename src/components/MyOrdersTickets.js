import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import OrdersList from './OrdersList'
import { getSummitFormattedDate } from '../utils'
import { getUserOrders, getUserTickets } from '../actions'
import { Box } from '@mui/material'

export const MyOrdersTickets = (props) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [isInitializing, setIsInitializing] = useState(true)
  const state = useSelector((state) => state || {}, shallowEqual)

  // console.log('state', state);
  const fetchData = async () => {
    dispatch(
      getUserOrders({ page: state.current_page, perPage: state.per_page })
    )
      .then(() => {
        dispatch(
          getUserTickets({ page: state.current_page, perPage: state.per_page })
        )
          .then(() => setIsInitializing(false))
          .catch((e) => {
            console.log(e)
            setIsInitializing(false)
          })
      })
      .catch((e) => {
        console.log(e)
        setIsInitializing(false)
      })
  }
  useEffect(() => {
    fetchData()
  }, [])
  return (
    <>
      <Box className='widget-header'>
        <h2 className='summit-title'>{state.summit.name}</h2>
        <h3 className='summit-date'>{getSummitFormattedDate(state.summit)}</h3>
      </Box>
      <OrdersList
        {...props}
        orders={state.memberOrders}
        summit={state.summit}
        tickets={state.memberTickets}
      />
    </>
  )
}

export default MyOrdersTickets

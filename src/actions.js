import i18n from './i18n'
import IdTokenVerifier from 'idtoken-verifier'
import Swal from 'sweetalert2'
import { objectToQueryString } from 'openstack-uicore-foundation/lib/utils/methods'
import { getIdToken } from 'openstack-uicore-foundation/lib/security/methods'
import {
  authErrorHandler,
  getRequest,
  deleteRequest,
  createAction,
  stopLoading,
  startLoading
} from 'openstack-uicore-foundation/lib/utils/actions'
import history from './history'

export const RESET_STATE = 'RESET_STATE'

// ORDERS CONSTS
export const GET_USER_ORDERS = 'GET_ORDERS'
export const REFUND_ORDER = 'REFUND_ORDER'
export const SET_ACTIVE_ORDER_ID = 'SET_ACTIVE_ORDER_ID'

// TICKETS CONSTS
export const GET_TICKETS = 'GET_TICKETS'
export const ASSIGN_TICKET = 'ASSIGN_TICKET'
export const REMOVE_TICKET_ATTENDEE = 'REMOVE_TICKET_ATTENDEE'
export const REFUND_TICKET = 'REFUND_TICKET'
export const RESEND_NOTIFICATION = 'RESEND_NOTIFICATION'
export const GET_TICKETS_BY_ORDER = 'GET_TICKETS_BY_ORDER'
export const GET_TICKETS_BY_ORDER_ERROR = 'GET_TICKETS_BY_ORDER_ERROR'
export const GET_ORDER_TICKET_DETAILS = 'GET_ORDER_TICKET_DETAILS'
export const GET_TICKET_DETAILS = 'GET_TICKET_DETAILS'
export const TICKET_ATTENDEE_KEYS = {
  email: 'attendee_email',
  firstName: 'attendee_first_name',
  lastName: 'attendee_last_name',
  company: 'attendee_company',
  disclaimerAccepted: 'disclaimer_accepted',
  extraQuestions: 'extra_questions'
}

// SUMMIT CONSTS
export const SET_SUMMIT = 'SET_SUMMIT'
export const GET_MAIN_EXTRA_QUESTIONS = 'GET_MAIN_EXTRA_QUESTIONS'
export const RECEIVE_MARKETING_SETTINGS = 'RECEIVE_MARKETING_SETTINGS'
export const CLEAR_MARKETING_SETTINGS = 'CLEAR_MARKETING_SETTINGS'

export const resetState = () => (dispatch) => {
  dispatch(createAction(RESET_STATE)({}))
}

// ORDERS ACTIONS
export const getUserOrders =
  ({ page = 1, perPage = 5 }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const { summit } = getState()

    // console.log('actions.js ', getState());

    const accessToken = getAccessToken()

    if (!accessToken) return Promise.reject()

    dispatch(startLoading())

    const params = {
      access_token: accessToken,
      order: '-id',
      filter: 'status==Paid',
      relations: 'none',
      page: page,
      per_page: perPage
    }

    return getRequest(
      null,
      createAction(GET_USER_ORDERS),
      `${apiBaseUrl}/api/v1/summits/${summit.id}/orders/me`,
      authErrorHandler
    )(params)(dispatch)
      .then(() => {
        dispatch(stopLoading())
      })
      .catch((e) => {
        dispatch(stopLoading())
        return e
      })
  }

export const cancelOrder =
  ({ order }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const {
      orderState: { current_page }
    } = getState()

    const accessToken = await getAccessToken().catch((_) =>
      history.replace(loginUrl)
    )

    if (!accessToken) return

    dispatch(startLoading())

    const params = {
      access_token: accessToken
    }

    return deleteRequest(
      null,
      createAction(REFUND_ORDER),
      `${apiBaseUrl}/api/v1/summits/all/orders/${order.id}/refund`,
      {},
      authErrorHandler
    )(params)(dispatch)
      .then((payload) => {
        dispatch(getUserOrders({ page: current_page }))
        dispatch(stopLoading())
      })
      .catch((e) => {
        dispatch(stopLoading())
        return e
      })
  }

export const setActiveOrderId = (orderId) => async (dispatch, getState) => {
  return dispatch(createAction(SET_ACTIVE_ORDER_ID)(orderId))
}

// TICKET ACTIONS
const customFetchErrorHandler = (response) => {
  let code = response.status
  let msg = response.statusText

  switch (code) {
    case 403:
      Swal.fire('ERROR', i18n.t('errors.user_not_authz'), 'warning')
      break
    case 401:
      Swal.fire('ERROR', i18n.t('errors.session_expired'), 'error')
      break
    case 412:
      msg = ''
      for (var [key, value] of Object.entries(response.errors)) {
        if (isNaN(key)) {
          msg += key + ': '
        }

        msg += value + '<br>'
      }
      Swal.fire('Validation error', msg, 'warning')
      break
    case 500:
      Swal.fire('ERROR', i18n.t('errors.server_error'), 'error')
  }
}

export const getUserTickets =
  ({ page = 1, perPage = 5 }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const {
      userState: { userProfile },
      summit
    } = getState()

    if (!summit) return Promise.reject()

    const accessToken = await getAccessToken()

    if (!accessToken) return Promise.reject()

    if (!userProfile.id) return Promise.reject()

    dispatch(startLoading())

    const params = {
      access_token: accessToken,
      expand: 'order, owner',
      order: '-id',
      fields:
        'order.id,order.owner_first_name,order.owner_last_name,order.owner_email,owner.first_name,owner.last_name,owner.status',
      'filter[]': [`status==Paid`, `order_owner_id<>${userProfile.id}`],
      relations: 'none',
      page: page,
      per_page: perPage
    }

    return getRequest(
      null,
      createAction(GET_TICKETS),
      `${apiBaseUrl}/api/v1/summits/${summit.id}/orders/all/tickets/me`,
      authErrorHandler
    )(params)(dispatch)
      .then(() => {
        dispatch(stopLoading())
      })
      .catch((e) => {
        dispatch(stopLoading())
        return e
      })
  }

export const getTicketById =
  ({ order, ticket }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const {
      userState: { userProfile },
      summit
    } = getState()

    const { id: orderId } = order
    const { id: ticketId } = ticket

    const fromOrderList = order.hasOwnProperty('tickets_excerpt_by_ticket_type')

    if (!summit) return

    const accessToken = await getAccessToken()

    if (!accessToken) return

    dispatch(startLoading())

    const params = {
      access_token: accessToken,
      expand: `${
        fromOrderList ? 'order' : ''
      }, owner, owner.extra_questions, badge, badge.features, refund_requests`,
      fields:
        'order.id, order.owner_first_name, order.owner_last_name, order.owner_email'
    }

    return getRequest(
      null,
      createAction(
        fromOrderList ? GET_ORDER_TICKET_DETAILS : GET_TICKET_DETAILS
      ),
      `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticketId}`,
      authErrorHandler
    )(params)(dispatch)
      .then(() => {
        dispatch(stopLoading())
      })
      .catch((e) => {
        dispatch(stopLoading())
        return e
      })
  }

export const getTicketsByOrder =
  ({ orderId, page = 1, perPage = 5 }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    dispatch(startLoading())

    const accessToken = await getAccessToken()

    if (!accessToken) return

    const params = {
      access_token: accessToken,
      expand:
        'refund_requests, owner, owner.extra_questions, badge, badge.features',
      order: '+id',
      page: page,
      per_page: perPage
    }

    return getRequest(
      null,
      createAction(GET_TICKETS_BY_ORDER),
      `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets`,
      authErrorHandler
    )(params)(dispatch)
      .then(() => {
        dispatch(stopLoading())
      })
      .catch((e) => {
        dispatch(stopLoading())
        dispatch(createAction(GET_TICKETS_BY_ORDER_ERROR))
        return e
      })
  }

export const assignAttendee =
  ({
    ticket,
    message,
    order,
    context,
    data: {
      attendee_email,
      attendee_first_name,
      attendee_last_name,
      attendee_company,
      disclaimer_accepted,
      extra_questions,
      reassignOrderId = null
    }
  }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch((_) =>
      history.replace(loginUrl)
    )

    if (!accessToken) return

    dispatch(startLoading())

    const {
      orderState: { current_page: orderPage },
      ticketState: {
        current_page: ticketPage,
        orderTickets: { current_page: orderTicketsCurrentPage }
      }
    } = getState()

    const params = {
      access_token: accessToken,
      expand:
        'owner,owner.extra_questions,badge,badge.type,badge.type.access_levels'
    }

    const normalizedEntity =
      !attendee_first_name & !attendee_last_name
        ? { attendee_email, message }
        : {
            attendee_email,
            attendee_first_name,
            attendee_last_name,
            attendee_company,
            extra_questions,
            disclaimer_accepted,
            message
          }

    const orderId = reassignOrderId ? reassignOrderId : order.id

    return putRequest(
      null,
      createAction(ASSIGN_TICKET),
      `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/attendee`,
      normalizedEntity,
      authErrorHandler
    )(params)(dispatch)
      .then((newTicket) => {
        if (reassignOrderId && context === 'ticket-list') {
          dispatch(getUserTickets({ page: ticketPage }))
        } else {
          dispatch(getUserOrders({ page: orderPage }))
          dispatch(
            getTicketsByOrder({ orderId, page: orderTicketsCurrentPage })
          )
        }
        return newTicket
      })
      .catch((e) => {
        dispatch(stopLoading())
        return e
      })
  }

export const editOwnedTicket =
  ({
    ticket,
    context,
    data: {
      attendee_email,
      attendee_first_name,
      attendee_last_name,
      attendee_company,
      disclaimer_accepted,
      extra_questions
    }
  }) =>
  async (
    dispatch,
    getState,
    { getAccessToken, getUserProfile, apiBaseUrl, loginUrl }
  ) => {
    const accessToken = await getAccessToken().catch((_) =>
      history.replace(loginUrl)
    )

    if (!accessToken) return

    dispatch(startLoading())

    const {
      userState: { userProfile },
      orderState: { current_page: orderPage },
      ticketState: {
        current_page: ticketPage,
        orderTickets: { current_page: orderTicketsCurrentPage }
      }
    } = getState()

    const params = {
      access_token: accessToken,
      expand: 'owner, owner.extra_questions'
    }

    const idToken = getIdToken()
    let company = ''
    if (idToken) {
      try {
        const verifier = new IdTokenVerifier()
        let jwt = verifier.decode(idToken)
        company = jwt.payload.company
      } catch (e) {
        console.log('error', e)
      }
    }

    const normalizedEntity = normalizeTicket({
      attendee_email,
      attendee_first_name,
      attendee_last_name,
      attendee_company,
      disclaimer_accepted,
      extra_questions
    })

    return putRequest(
      null,
      createAction(ASSIGN_TICKET),
      `${apiBaseUrl}/api/v1/summits/all/orders/all/tickets/${ticket.id}`,
      normalizedEntity,
      authErrorHandler
    )(params)(dispatch)
      .then(async () => {
        // email should match ( only update my profile is ticket belongs to me!)
        // Check if there's changes in the ticket data to update the profile
        if (
          userProfile.email == attendee_email &&
          (attendee_company.name !== company ||
            attendee_first_name !== userProfile.first_name ||
            attendee_last_name !== userProfile.last_name)
        ) {
          const newProfile = {
            first_name: attendee_first_name,
            last_name: attendee_last_name,
            company: attendee_company.name
          }
          dispatch(updateProfile(newProfile))
        }

        // Note: make sure we re-fetch the user profile for the parent app.
        await getUserProfile()

        // Note: refresh the list view after updating the ticket.
        if (context === 'ticket-list') {
          dispatch(getUserTickets({ page: ticketPage }))
        } else {
          dispatch(getUserOrders({ page: orderPage })).then(() =>
            dispatch(
              getTicketsByOrder({
                orderId: ticket.order_id,
                page: orderTicketsCurrentPage
              })
            )
          )
        }

        dispatch(stopLoading())
      })
      .catch((e) => {
        dispatch(stopLoading())
        return e
      })
  }

export const resendNotification =
  (ticket) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch((_) =>
      history.replace(loginUrl)
    )

    if (!accessToken) return

    const { message } = ticket

    dispatch(startLoading())

    const orderId = ticket.order ? ticket.order.id : ticket.order_id

    const params = {
      access_token: accessToken
    }

    return putRequest(
      null,
      createAction(RESEND_NOTIFICATION),
      `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/attendee/reinvite`,
      { message },
      authErrorHandler
    )(params)(dispatch)
      .then(() => {
        dispatch(stopLoading())
      })
      .catch((e) => {
        dispatch(stopLoading())
        return e
      })
  }

export const changeTicketAttendee =
  ({ ticket, message, order, context, data: { attendee_email } }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch((_) =>
      history.replace(loginUrl)
    )

    if (!accessToken) return

    dispatch(startLoading())

    const params = {
      access_token: accessToken,
      expand: 'order, owner, owner.extra_questions, order.summit'
    }

    const orderId = ticket.order ? ticket.order.id : ticket.order_id

    return deleteRequest(
      null,
      createAction(REMOVE_TICKET_ATTENDEE),
      `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/attendee`,
      {},
      authErrorHandler
    )(params)(dispatch)
      .then(() => {
        return dispatch(
          assignAttendee({
            ticket,
            message,
            order,
            context,
            data: {
              attendee_email,
              attendee_first_name: '',
              attendee_last_name: '',
              attendee_company: '',
              disclaimer_accepted: false,
              extra_questions: [],
              reassignOrderId: orderId
            }
          })
        )
      })
      .catch((e) => {
        console.log('error', e)
        dispatch(stopLoading())
        return e
      })
  }

export const removeAttendee =
  ({ ticket, context }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const {
      orderState: { current_page: orderPage },
      ticketState: {
        current_page: ticketPage,
        orderTickets: { current_page: orderTicketsCurrentPage }
      }
    } = getState()

    const accessToken = await getAccessToken().catch((_) =>
      history.replace(loginUrl)
    )

    if (!accessToken) return

    dispatch(startLoading())

    const params = {
      access_token: accessToken,
      expand: 'order, owner, owner.extra_questions, order.summit'
    }

    const orderId = ticket.order ? ticket.order.id : ticket.order_id

    return deleteRequest(
      null,
      createAction(REMOVE_TICKET_ATTENDEE),
      `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/attendee`,
      {},
      authErrorHandler
    )(params)(dispatch)
      .then((removedTicket) => {
        if (context === 'ticket-list') {
          dispatch(getUserTickets({ page: ticketPage }))
        } else {
          dispatch(getUserOrders({ page: orderPage }))
          dispatch(
            getTicketsByOrder({ orderId, page: orderTicketsCurrentPage })
          )
        }
        return removedTicket
      })
      .catch((e) => {
        console.log('error', e)
        dispatch(stopLoading())
        return e
      })
  }

export const getTicketPDF =
  ({ ticket }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch((_) =>
      history.replace(loginUrl)
    )

    if (!accessToken) return

    dispatch(startLoading())

    const params = {
      access_token: accessToken
    }

    const orderId = ticket.order ? ticket.order.id : ticket.order_id

    const queryString = objectToQueryString(params)
    const apiUrl = `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/pdf?${queryString}`

    return fetch(apiUrl, {
      responseType: 'Blob',
      headers: { 'Content-Type': 'application/pdf' }
    })
      .then((response) => {
        if (!response.ok) {
          dispatch(stopLoading())
          throw response
        } else {
          return response.blob()
        }
      })
      .then((pdf) => {
        dispatch(stopLoading())
        let link = document.createElement('a')
        const url = window.URL.createObjectURL(pdf)
        link.href = url
        link.download = 'ticket.pdf'
        link.dispatchEvent(new MouseEvent('click'))
      })
      .catch(customFetchErrorHandler)
  }

export const refundTicket =
  ({ ticket, order }) =>
  async (dispatch, getState, { getAccessToken, apiBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch((_) =>
      history.replace(loginUrl)
    )

    if (!accessToken) return

    dispatch(startLoading())

    const {
      orderState: { current_page: orderPage },
      ticketState: { current_page: ticketPage }
    } = getState()

    const orderId = ticket.order ? ticket.order.id : ticket.order_id

    const params = {
      access_token: accessToken
    }

    return deleteRequest(
      null,
      createAction(REFUND_TICKET),
      `${apiBaseUrl}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/refund`,
      {},
      authErrorHandler
    )(params)(dispatch)
      .then((payload) => {
        dispatch(stopLoading())

        if (ticket.order_id) {
          dispatch(getUserOrders({ page: orderPage }))
        } else {
          dispatch(getUserTickets({ page: ticketPage }))
        }
      })
      .catch((e) => {
        dispatch(stopLoading())
        throw e
      })
  }

const normalizeTicket = (entity) => {
  const normalizedEntity = { ...entity }

  if (!entity.attendee_company.id) {
    normalizedEntity['attendee_company'] = entity.attendee_company.name
  } else {
    delete normalizedEntity['attendee_company']
    normalizedEntity['attendee_company_id'] = entity.attendee_company.id
  }

  return normalizedEntity
}

// USER ACTIONS

// SUMMIT ACTIONS
export const setSummit = (summit) => async (dispatch) =>
  dispatch(createAction(SET_SUMMIT)(summit))

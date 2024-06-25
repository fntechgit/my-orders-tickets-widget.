/**
 * Copyright 2024 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions'
import {
  RESET_STATE,
  SET_SUMMIT,
  GET_USER_ORDERS,
  GET_TICKETS,
  GET_TICKETS_BY_ORDER,
  GET_ORDER_TICKET_DETAILS,
  GET_TICKET_DETAILS
} from './actions'

const DEFAULT_ENTITY = {
  first_name: '',
  last_name: '',
  email: '',
  company: {
    name: '',
    id: null
  },
  billing_country: '',
  billing_address: '',
  billing_address_two: '',
  billing_city: '',
  billing_state: '',
  billing_zipcode: '',
  currentStep: null,
  tickets: [],
  reservation: {},
  checkout: {}
}

const DEFAULT_STATE = {
  settings: {},
  summit: null,
  widgetLoading: false,
  purchaseOrder: DEFAULT_ENTITY,
  memberOrders: [],
  memberTickets: [],
  orderTickets: {
    total: 0,
    per_page: 5,
    current_page: 1,
    last_page: 1,
    tickets: []
  },
  selectedTicket: null,
  errors: {},
  stripeForm: false,
  loaded: false,
  loading: false,
  activeOrderId: null,
  isOrderLoading: false,
  current_page: 1,
  last_page: 1,
  per_page: 5,
  total: 0
}

const WidgetReducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action
  switch (type) {
    case LOGOUT_USER:
      return DEFAULT_STATE
      break
    case RESET_STATE:
      return { ...state, ...DEFAULT_STATE }
      break
    case SET_SUMMIT:
      return { ...state, summit: payload }
      break
    case GET_USER_ORDERS:
      return { ...state, memberOrders: payload.response.data }
      break
    case GET_TICKETS:
      let { data, current_page, total, last_page } = payload.response
      const lastEditedTicket = state.selectedTicket
      if (lastEditedTicket) {
        const ticketToUpdate = data.find((t) => t.id === lastEditedTicket.id)
        data = [
          ...data.filter((t) => t.id !== lastEditedTicket.id),
          { ...ticketToUpdate, ...lastEditedTicket }
        ]
      }
      return {
        ...state,
        memberTickets: data,
        current_page,
        total,
        last_page,
        selectedTicket: null
      }
    case GET_TICKETS_BY_ORDER: {
      const { total, per_page, current_page, last_page, data } =
        payload.response
      return {
        ...state,
        orderTickets: {
          total,
          per_page,
          current_page,
          last_page,
          tickets: data
        }
      }
    }
    case GET_ORDER_TICKET_DETAILS: {
      const ticket = payload.response
      const oldTicket = state.orderTickets.tickets.find(
        (t) => t.id === ticket.id
      )
      const updatedTicket = { ...oldTicket, ...ticket }
      const orderTickets = [
        ...state.orderTickets.tickets.filter((t) => t.id !== ticket.id),
        updatedTicket
      ].sort((a, b) => b.id - a.id)
      return {
        ...state,
        orderTickets: { ...state.orderTickets, tickets: orderTickets }
      }
    }
    case GET_TICKET_DETAILS: {
      const ticket = payload.response
      const oldTicket = state.memberTickets.find((t) => t.id === ticket.id)
      const updatedTicket = { ...oldTicket, ...ticket }
      const memberTickets = [
        ...state.memberTickets.filter((t) => t.id !== ticket.id),
        updatedTicket
      ].sort((a, b) => b.id - a.id)
      return { ...state, memberTickets }
    }
  }
  return state
}

export default WidgetReducer

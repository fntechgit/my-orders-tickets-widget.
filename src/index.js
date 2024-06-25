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

import React from 'react'
import MyOrdersMyTicketsWidget from './my-orders-tickets-widget'
import { createRoot } from 'react-dom/client'
import { storeAuthInfo } from 'openstack-uicore-foundation/lib/security/methods'
import './i18n'
import './styles/general.scss'

/** TODO: DELETE AND USE REAL DATA PULLED FROM API */
import { user, summit } from './__mocks__/mockData'

storeAuthInfo(process.env.ACCESS_TOKEN, 0)

const widgetProps = {
  user,
  summit,
  getAccessToken: () => process.env.ACCESS_TOKEN,
  apiBaseUrl: process.env.API_BASE_URL
}

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <div className='container orders-ticket-widget-container'>
    <MyOrdersMyTicketsWidget {...widgetProps} />
  </div>
)

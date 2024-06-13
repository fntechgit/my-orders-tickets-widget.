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
import React from 'react';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import WidgetReducer from './reducer'

class MyOrdersMyTicketsWidget extends React.PureComponent {

  constructor(props) {
    super(props);

    this.store = createStore(WidgetReducer, applyMiddleware(thunk));
  }

  render() {
    return (
      <Provider store={this.store}>
      </Provider>
    );
  }
}

export default MyOrdersMyTicketsWidget;

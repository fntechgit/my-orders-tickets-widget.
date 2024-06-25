import { useMemo } from 'react'
import WidgetReducer from './reducer'
import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import thunk from 'redux-thunk'
import storage from 'redux-persist/lib/storage'

export const getStore = ({
  clientId,
  loginUrl,
  supportEmail,
  getAccessToken,
  getUserProfile,
  summit,
  user,
  apiBaseUrl
}) => {
  const persistConfig = {
    key: 'root',
    version: 1,
    storage
  }

  const store = configureStore({
    reducer: persistReducer(persistConfig, WidgetReducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            clientId,
            apiBaseUrl,
            summit,
            loginUrl,
            supportEmail,
            getAccessToken,
            getUserProfile
          }
        },
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
      })
  })

  return store
}

export const getPersistor = (store) => {
  const onRehydrateComplete = () => {
    const { loggedUserState } = store.getState()

    // repopulate access token on global access variable
    window.accessToken = loggedUserState?.accessToken
    window.idToken = loggedUserState?.idToken
    window.sessionState = loggedUserState?.sessionState
  }

  const persistor = persistStore(store, null, onRehydrateComplete)

  return persistor
}

export const useInitStore = (config) => {
  const store = useMemo(() => getStore(config), [])
  const persistor = useMemo(() => getPersistor(store), [store])

  return {
    store,
    persistor
  }
}

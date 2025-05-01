import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { newOrderApi } from './services/newOrderApi';
import newOrderSlice from './slice/newOrderSlice';
import userDetailsSlice from './slice/userDetails';

export const store = configureStore({
  reducer: {
    userDetails: userDetailsSlice,
    newOrder: newOrderSlice,
    [newOrderApi.reducerPath]: newOrderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      newOrderApi.middleware
    ),
});
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

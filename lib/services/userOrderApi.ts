import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userOrderApi = createApi({
  reducerPath: 'userOrderApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  tagTypes: ['UserOrders'],
  endpoints: (builder) => ({
    getUserOrders: builder.query({
      query: ({ page = 1, limit = 10, status = '', search = '' }) => ({
        url: `/api/user/orders?page=${page}&limit=${limit}&status=${status}&search=${search}`,
        method: 'GET',
      }),
      providesTags: ['UserOrders'],
    }),
    
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/api/user/create-orders',
        method: 'POST',
        body: orderData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['UserOrders'],
    }),
  }),
});

export const { 
  useGetUserOrdersQuery, 
  useCreateOrderMutation 
} = userOrderApi; 
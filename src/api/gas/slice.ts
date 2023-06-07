import { TransactionRequest } from '@ethersproject/providers'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { GasFeeResponse } from './types'

export const gasApi = createApi({
  reducerPath: 'gasApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.uniswap.org/v1/gas-fee',
  }),
  endpoints: (builder) => ({
    gasFee: builder.query<GasFeeResponse, TransactionRequest>({
      query: (transaction: TransactionRequest) => ({
        url: '/',
        body: transaction,
        method: 'POST',
      }),
    }),
  }),
})

export const { useGasFeeQuery } = gasApi

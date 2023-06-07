import { TransactionRequest } from '@ethersproject/providers'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { PollingInterval } from 'graphql/data/util'
import { Maybe } from 'graphql/jsutils/Maybe'
import { useMemo } from 'react'
import { isL2ChainId } from 'utils/chains'

import { useGasFeeQuery } from './slice'
import { FeeType, GasSpeed, TransactionGasFeeInfo } from './types'

function getPollingIntervalByChainId(chainId?: number) {
  return isL2ChainId(chainId) ? PollingInterval.LightningMcQueen : PollingInterval.Fast
}

export function useTransactionGasFee(
  tx: Maybe<TransactionRequest>,
  speed: GasSpeed = GasSpeed.Urgent,
  skip?: boolean
): TransactionGasFeeInfo | undefined {
  const { data } = useGasFeeQuery((!skip && tx) || skipToken, {
    pollingInterval: getPollingIntervalByChainId(tx?.chainId),
  })

  return useMemo(() => {
    if (!data) return undefined

    const params =
      data.type === FeeType.Eip1559
        ? {
            maxPriorityFeePerGas: data.maxPriorityFeePerGas[speed],
            maxFeePerGas: data.maxFeePerGas[speed],
            gasLimit: data.gasLimit,
          }
        : {
            gasPrice: data.gasPrice[speed],
            gasLimit: data.gasLimit,
          }

    return {
      type: data.type,
      speed,
      gasFee: data.gasFee[speed],
      params,
    }
  }, [data, speed])
}

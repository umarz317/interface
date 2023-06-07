import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { CurrencyAmount, MaxUint256, NativeCurrency, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useTransactionGasFee } from 'api/gas/hooks'
import { GasSpeed } from 'api/gas/types'
import { useCallback, useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'

import { useAsyncData } from './useAsyncData'
import { useTokenContract } from './useContract'
import { Allowance, AllowanceState } from './usePermit2Allowance'
import { useUSDPrice } from './useUSDPrice'

type GasBreakdown = {
  total?: string
  approvalEstimate?: string
  swapEstimate?: string | null
}

export function useGasBreakdown({
  trade,
  allowance,
  nativeCurrency,
}: {
  trade: InterfaceTrade
  allowance?: Allowance
  nativeCurrency: NativeCurrency | Token
}): GasBreakdown {
  const { chainId } = useWeb3React()
  // Token Approval Gas Estimate
  const needsApprovalTransaction = allowance?.state === AllowanceState.REQUIRED && allowance.needsPermit2Approval
  const contract = useTokenContract(
    trade.inputAmount.currency.isToken ? trade.inputAmount.currency?.address : undefined
  )

  // Generate the transaction to use as an input to the gas API
  const transactionFetcher = useCallback(async () => {
    if (!needsApprovalTransaction) {
      return undefined
    }
    return await contract?.populateTransaction.approve(PERMIT2_ADDRESS, MaxUint256.toString())
  }, [contract?.populateTransaction, needsApprovalTransaction])
  const { data: approvalTransaction, isLoading } = useAsyncData(transactionFetcher)
  // Call the Gas API for the approval transaction
  const approvalEstimate = useTransactionGasFee(
    { ...approvalTransaction, chainId },
    GasSpeed.Urgent,
    isLoading || !needsApprovalTransaction // skip
  )
  // Convert the wei response to USD
  const approvalGasFeeWei = approvalEstimate?.gasFee
  const { data: approvalGasFeeUSD } = useUSDPrice(
    CurrencyAmount.fromRawAmount(nativeCurrency, approvalGasFeeWei ?? '0')
  )

  return useMemo(() => {
    const totalUSD = (approvalGasFeeUSD ?? 0) + parseFloat(trade.gasUseEstimateUSD ?? '0')
    return {
      total: formatNumber(totalUSD, NumberType.FiatGasPrice),
      approvalEstimate:
        needsApprovalTransaction && approvalGasFeeUSD
          ? formatNumber(approvalGasFeeUSD, NumberType.FiatGasPrice)
          : undefined,
      swapEstimate: `$${trade.gasUseEstimateUSD}`,
    }
  }, [approvalGasFeeUSD, needsApprovalTransaction, trade.gasUseEstimateUSD])
}

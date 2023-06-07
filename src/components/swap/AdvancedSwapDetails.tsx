import { Trans } from '@lingui/macro'
import { sendAnalyticsEvent } from '@uniswap/analytics'
import { InterfaceElementName, SwapEventName } from '@uniswap/analytics-events'
import { Percent, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { LoadingRows } from 'components/Loader/styled'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import { useGasBreakdown } from 'hooks/useGasBreakdown'
import { Allowance } from 'hooks/usePermit2Allowance'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { InterfaceTrade } from 'state/routing/types'
import formatPriceImpact from 'utils/formatPriceImpact'

import { Separator, ThemedText } from '../../theme'
import Column from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { MouseoverTooltip, TooltipSize } from '../Tooltip'
import { GasBreakdownTooltip } from './GasBreakdownTooltip'
import RouterLabel from './RouterLabel'
import SwapRoute from './SwapRoute'

interface AdvancedSwapDetailsProps {
  trade: InterfaceTrade
  allowedSlippage: Percent
  syncing?: boolean
  allowance?: Allowance
}

function TextWithLoadingPlaceholder({
  syncing,
  width,
  children,
}: {
  syncing: boolean
  width: number
  children: JSX.Element
}) {
  return syncing ? (
    <LoadingRows data-testid="loading-rows">
      <div style={{ height: '15px', width: `${width}px` }} />
    </LoadingRows>
  ) : (
    children
  )
}

export function AdvancedSwapDetails({ trade, allowedSlippage, syncing = false, allowance }: AdvancedSwapDetailsProps) {
  const { chainId } = useWeb3React()
  const nativeCurrency = useNativeCurrency(chainId)

  const {
    total: totalGasEstimate,
    approvalEstimate,
    swapEstimate,
  } = useGasBreakdown({ trade, allowance, nativeCurrency })

  return (
    <Column gap="md">
      <Separator />
      {!trade.gasUseEstimateUSD || !chainId || !SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId) ? null : (
        <RowBetween>
          <MouseoverTooltip
            text={
              <Trans>
                The fee paid to miners who process your transaction. This must be paid in {nativeCurrency.symbol}.
              </Trans>
            }
          >
            <ThemedText.BodySmall color="textSecondary">
              <Trans>Network fees</Trans>
            </ThemedText.BodySmall>
          </MouseoverTooltip>
          <MouseoverTooltip
            // If there is only one transaction/estimate, we don't need a breakdown.
            disabled={!(approvalEstimate || swapEstimate)}
            placement="right"
            size={TooltipSize.Small}
            text={<GasBreakdownTooltip trade={trade} swapEstimate={swapEstimate} approvalEstimate={approvalEstimate} />}
          >
            <TextWithLoadingPlaceholder syncing={syncing} width={50}>
              <ThemedText.BodySmall>~{totalGasEstimate}</ThemedText.BodySmall>
            </TextWithLoadingPlaceholder>
          </MouseoverTooltip>
        </RowBetween>
      )}
      <RowBetween>
        <MouseoverTooltip text={<Trans>The impact your trade has on the market price of this pool.</Trans>}>
          <ThemedText.BodySmall color="textSecondary">
            <Trans>Price Impact</Trans>
          </ThemedText.BodySmall>
        </MouseoverTooltip>
        <TextWithLoadingPlaceholder syncing={syncing} width={50}>
          <ThemedText.BodySmall>{formatPriceImpact(trade.priceImpact)}</ThemedText.BodySmall>
        </TextWithLoadingPlaceholder>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <MouseoverTooltip
            text={
              <Trans>
                The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will
                revert.
              </Trans>
            }
          >
            <ThemedText.BodySmall color="textSecondary">
              {trade.tradeType === TradeType.EXACT_INPUT ? <Trans>Minimum output</Trans> : <Trans>Maximum input</Trans>}
            </ThemedText.BodySmall>
          </MouseoverTooltip>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={70}>
          <ThemedText.BodySmall>
            {trade.tradeType === TradeType.EXACT_INPUT
              ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
              : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
          </ThemedText.BodySmall>
        </TextWithLoadingPlaceholder>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <MouseoverTooltip
            text={
              <Trans>
                The amount you expect to receive at the current market price. You may receive less or more if the market
                price changes while your transaction is pending.
              </Trans>
            }
          >
            <ThemedText.BodySmall color="textSecondary">
              <Trans>Expected output</Trans>
            </ThemedText.BodySmall>
          </MouseoverTooltip>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={65}>
          <ThemedText.BodySmall>
            {`${trade.outputAmount.toSignificant(6)} ${trade.outputAmount.currency.symbol}`}
          </ThemedText.BodySmall>
        </TextWithLoadingPlaceholder>
      </RowBetween>
      <Separator />
      <RowBetween>
        <ThemedText.BodySmall color="textSecondary">
          <Trans>Order routing</Trans>
        </ThemedText.BodySmall>
        <MouseoverTooltip
          size={TooltipSize.Large}
          text={<SwapRoute data-testid="swap-route-info" trade={trade} syncing={syncing} />}
          onOpen={() => {
            sendAnalyticsEvent(SwapEventName.SWAP_AUTOROUTER_VISUALIZATION_EXPANDED, {
              element: InterfaceElementName.AUTOROUTER_VISUALIZATION_ROW,
            })
          }}
        >
          <RouterLabel />
        </MouseoverTooltip>
      </RowBetween>
    </Column>
  )
}

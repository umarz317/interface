import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { InterfaceTrade } from 'state/routing/types'
import styled from 'styled-components/macro'
import { Divider, ThemedText } from 'theme'

const Container = styled(AutoColumn)`
  padding: 4px;
`

const InlineLink = styled(ThemedText.Caption)`
  color: ${({ theme }) => theme.accentAction};
  display: inline;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`

export function GasBreakdownTooltip({
  trade,
  approvalEstimate,
  swapEstimate,
}: {
  trade: InterfaceTrade
  approvalEstimate?: string | null
  swapEstimate?: string | null
}) {
  return (
    <Container gap="md">
      <AutoColumn gap="sm">
        {approvalEstimate && (
          <Row justify="space-between">
            <ThemedText.SubHeaderSmall>
              <Trans>Allow {trade.inputAmount.currency.symbol} (one time)</Trans>
            </ThemedText.SubHeaderSmall>
            <ThemedText.SubHeaderSmall color="textPrimary">{approvalEstimate}</ThemedText.SubHeaderSmall>
          </Row>
        )}
        {swapEstimate && (
          <Row justify="space-between">
            <ThemedText.SubHeaderSmall>
              <Trans>Swap</Trans>
            </ThemedText.SubHeaderSmall>
            <ThemedText.SubHeaderSmall color="textPrimary">{swapEstimate}</ThemedText.SubHeaderSmall>
          </Row>
        )}
      </AutoColumn>
      <Divider />
      <ThemedText.Caption color="textSecondary">
        Network Fees are paid to the Ethereum network to secure transactions. <InlineLink>Learn more</InlineLink>
      </ThemedText.Caption>
    </Container>
  )
}

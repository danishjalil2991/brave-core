/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

import { OrderSummary } from '../orderSummary'
import { UseWalletPanel } from '../useWalletPanel'
import { UseCreditCardPanel } from '../useCreditCardPanel'
import { CreditCardDetails } from '../creditCardForm'

interface PaymentMethodPanelProps {
  rewardsEnabled?: boolean
  orderDescription: string
  orderTotal: number
  orderTotalConverted: string
  walletBalance: number
  walletBalanceConverted: string
  walletVerified?: boolean
  walletLastUpdated: string
  onPayWithCreditCard: (cardDetails: CreditCardDetails) => void
  onPayWithWallet: () => void
  onShowAddFunds: () => void
}

export function PaymentMethodPanel (props: PaymentMethodPanelProps) {
  const [continueWithCard, setContinueWithCard] = React.useState<boolean>(false)
  const hasSufficientFunds = props.walletBalance >= props.orderTotal

  return (
    <>
      <h1>Payment Method</h1>
      <OrderSummary
        description={props.orderDescription}
        orderTotal={props.orderTotal.toFixed(1)}
        orderTotalConverted={props.orderTotalConverted}
      />
      {
        continueWithCard ? null :
          <UseWalletPanel
            balance={props.walletBalance.toFixed(1)}
            balanceConverted={props.walletBalanceConverted}
            lastUpdated={props.walletLastUpdated}
            hasSufficientFunds={hasSufficientFunds}
            rewardsEnabled={props.rewardsEnabled}
            walletVerified={props.walletVerified}
            onShowAddFunds={props.onShowAddFunds}
            onPayWithWallet={props.onPayWithWallet}
          />
      }
      <UseCreditCardPanel
        hasSufficientFunds={hasSufficientFunds}
        rewardsEnabled={props.rewardsEnabled}
        walletVerified={props.walletVerified}
        continueWithCard={continueWithCard}
        setContinueWithCard={setContinueWithCard}
        onPayWithCreditCard={props.onPayWithCreditCard}
      />
    </>
  )
}

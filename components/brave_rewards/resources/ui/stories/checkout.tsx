/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { storiesOf } from '@storybook/react'
import * as knobs from '@storybook/addon-knobs'

import { DialogFrame } from '../components/checkout/dialogFrame'
import { PaymentMethodPanel } from '../components/checkout/paymentMethodPanel'
import { AddFundsPanel } from '../components/checkout/addFundsPanel'
import { PaymentProcessing } from '../components/checkout/paymentProcessing'
import { PaymentComplete } from '../components/checkout/paymentComplete'

function onDialogClose () {
  // Empty
}

function actionLogger (type: string) {
  return (data?: any) => { console.log(type, ':', data) }
}

storiesOf('Rewards/Checkout', module)
  .addDecorator(knobs.withKnobs)
  .add('Payment Method', () => {
    const defaultDescription =
      'Title of the selected item long title long ' +
      'long title wrapped into second line'

    return (
      <DialogFrame showBackground={true} showTitle={true} onClose={onDialogClose}>
        <PaymentMethodPanel
          rewardsEnabled={knobs.boolean('rewardsEnabled', true)}
          orderDescription={knobs.text('orderDescription', defaultDescription)}
          orderTotal={knobs.number('orderTotal', 45)}
          orderTotalConverted={knobs.text('orderTotalConverted', '$9.00')}
          walletBalance={knobs.number('walletBalance', 100)}
          walletBalanceConverted={knobs.text('walletBalanceConverted', '$20.00')}
          walletLastUpdated={knobs.text('walletLastUpdated', 'Today at 11:38 am')}
          walletVerified={knobs.boolean('walletVerified', true)}
          onPayWithCreditCard={actionLogger('onPaymentWithCreditCard')}
          onPayWithWallet={actionLogger('onPaymentWithWallet')}
          onShowAddFunds={actionLogger('onShowAddFunds')}
        />
      </DialogFrame>
    )
  })
  .add('Add Funds', () => {
    const defaultAmounts = [
      {
        amount: 30,
        amountConverted: '$6.00',
        transactionFeeRate: '3%',
        transactionFee: '$0.18',
        totalCharge: '$6.18'
      },
      {
        amount: 50,
        amountConverted: '$10.00',
        transactionFeeRate: '3%',
        transactionFee: '$0.18',
        totalCharge: '$10.18'
      },
      {
        amount: 100,
        amountConverted: '$20.00',
        transactionFeeRate: '3%',
        transactionFee: '$0.18',
        totalCharge: '$20.18'
      }
    ]

    return (
      <DialogFrame showBackground={true} showTitle={true} onClose={onDialogClose}>
        <AddFundsPanel
          amountNeeded={knobs.text('amountNeeded', '30')}
          walletBalance={knobs.text('walletBalance', '15.0')}
          walletBalanceConverted={knobs.text('walletBalanceConverted', '$3.00')}
          unitValueConverted={knobs.text('unitValueConverted', '$0.1873')}
          amountOptions={knobs.object('amountOptions', defaultAmounts)}
          onCancel={actionLogger('onCancel')}
          onPayWithCreditCard={actionLogger('onPayWithCreditCard')}
        />
      </DialogFrame>
    )
  })
  .add('Processing', () => {
    return (
      <DialogFrame showTitle={true} onClose={onDialogClose}>
        <PaymentProcessing />
      </DialogFrame>
    )
  })
  .add('Complete', () => {
    return (
      <DialogFrame onClose={onDialogClose}>
        <PaymentComplete />
      </DialogFrame>
    )
  })

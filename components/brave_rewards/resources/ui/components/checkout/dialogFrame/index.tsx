/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { CloseStrokeIcon, BatColorIcon } from 'brave-ui/components/icons'

import {
  MainPanel,
  Content,
  TopBar,
  DialogTitle,
  CloseButton,
  BatText
} from './style'

export interface DialogFrameProps {
  onClose: () => void
  children: React.ReactNode
  showTitle?: boolean
  showBackground?: boolean
}

export function DialogFrame (props: DialogFrameProps) {
  return (
    <MainPanel showBackground={props.showBackground}>
      <TopBar>
        {
          !props.showTitle ? null : <>
            <DialogTitle>
              <BatColorIcon /> <BatText>BAT</BatText> Checkout
            </DialogTitle>
          </>
        }
        <CloseButton onClick={props.onClose}>
          <CloseStrokeIcon />
        </CloseButton>
      </TopBar>
      <Content>
        {props.children}
      </Content>
    </MainPanel>
  )
}

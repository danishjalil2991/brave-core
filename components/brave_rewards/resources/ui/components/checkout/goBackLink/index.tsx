/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { CaratStrongLeftIcon } from 'brave-ui/components/icons'

import { Container } from './style'

interface GoBackLinkProps {
  onClick: () => void
}

export function GoBackLink (props: GoBackLinkProps) {
  return (
    <Container>
      <a href='javascript:void 0' onClick={props.onClick}>
        <CaratStrongLeftIcon />
        Go Back
      </a>
    </Container>
  )
}

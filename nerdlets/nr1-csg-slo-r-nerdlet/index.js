import React from 'react';
import { NerdletStateContext } from 'nr1';

import SLOREntityNerdlet from '../slo-r-entity';

export default class Nr1CsgSloR extends React.Component {
  render() {
    return (
      <NerdletStateContext.Consumer>
        {nerdletUrlState => (
          <SLOREntityNerdlet nerdletUrlState={nerdletUrlState} />
        )}
      </NerdletStateContext.Consumer>
    );
  }
}

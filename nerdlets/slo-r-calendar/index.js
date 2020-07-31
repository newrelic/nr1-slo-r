import React from 'react';
import { NerdletStateContext, HeadingText } from 'nr1';
import { Calendar } from './components';

const SloRCalendar = () => (
  <NerdletStateContext.Consumer>
    {({ slo_document }) => (
      <div>
        <div className="container">
          <HeadingText type={HeadingText.TYPE.HEADING_2}>
            Calendar: {slo_document.name}
          </HeadingText>
          <Calendar slo={slo_document} />
        </div>
      </div>
    )}
  </NerdletStateContext.Consumer>
);

export default SloRCalendar;

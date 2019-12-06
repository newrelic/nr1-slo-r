import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Grid, GridItem } from 'nr1';

export default class SLOGrid extends Component {
  static propTypes = {
    data: PropTypes.array,
    toggleViewModal: PropTypes.func,
    toggleUpdateModal: PropTypes.func,
    deleteCallback: PropTypes.func
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { data } = this.props;

    // todo: The color coding for 7 and 30 day are not working. Fix that.
    const SLOGridItems = data.map((document, index) => {
      return (
        <GridItem className="slo-grid-item" key={index} columnSpan={3}>
          <header className="slo-grid-item-header">
            <h4 className="slo-grid-item-header-title">{document.name}</h4>
            <span className="slo-grid-item-header-type">{document.type}</span>
            <div className="slo-grid-item-section-update-view-button">
              <Button
                iconType={
                  Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__LOGS
                }
                sizeType={Button.SIZE_TYPE.SMALL}
                onClick={() => {
                  this.props.toggleViewModal({
                    document
                  });
                }}
              />
            </div>
            <div className="slo-grid-item-section-update-button">
              <Button
                iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_EDIT}
                sizeType={Button.SIZE_TYPE.SMALL}
                onClick={() => {
                  this.props.toggleUpdateModal({
                    document
                  });
                }}
              />
            </div>
            <div className="slo-grid-item-section-delete-button">
              <Button
                iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
                sizeType={Button.SIZE_TYPE.SMALL}
                onClick={() => this.props.deleteCallback({ document })}
              />
            </div>
          </header>
          <div
            className={`slo-grid-item-section section-current ${
              document.current < document.target ? 'status-poor' : 'status-good'
            }`}
          >
            <span className="slo-grid-item-section-value">
              {document.current}
            </span>
            <span className="slo-grid-item-section-label">Current</span>
          </div>
          <div className="slo-grid-item-section section-org">
            <span className="slo-grid-item-section-value">{document.org}</span>
            <span className="slo-grid-item-section-label">Org</span>
          </div>
          <div
            className={`slo-grid-item-section section-7day ${
              document['7_day'] < document.target ? 'status-poor' : ''
            }`}
          >
            <span className="slo-grid-item-section-value">
              {document['7_day']}
            </span>
            <span className="slo-grid-item-section-label">7 day</span>
          </div>
          <div
            className={`slo-grid-item-section section-30day ${
              document['30_day'] < document.target ? 'status-poor' : ''
            }`}
          >
            <span className="slo-grid-item-section-value">
              {document['30_day']}
            </span>
            <span className="slo-grid-item-section-label">30 day</span>
          </div>
          <div className="slo-grid-item-section section-target">
            <span className="slo-grid-item-section-value">
              {document.target}
            </span>
            <span className="slo-grid-item-section-label">target</span>
          </div>
        </GridItem>
      );
    });

    return (
      <Grid
        className="slo-grid-container"
        spacingType={[Grid.SPACING_TYPE.SMALL, Grid.SPACING_TYPE.EXTRA_LARGE]}
        fullHeight
      >
        {SLOGridItems}
      </Grid>
    );
  } // render
}

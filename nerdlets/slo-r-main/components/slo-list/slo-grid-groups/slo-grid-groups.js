import React from 'react';
import PropTypes from 'prop-types';
import { GridItem, Icon, Button, Tooltip } from 'nr1';
import SettingsMenu from '../settings-menu';
import { sloIndicatorLabelLookup } from '../../../../shared/helpers';

const SloGridTags = ({
  document,
  index,
  toggleViewModal,
  toggleUpdateModal,
  deleteCallback
}) => {
  return (
    <GridItem className="slo-grid-item" key={index} columnSpan={3}>
      <header className="slo-grid-item-header">
        <h4 className="slo-grid-item-header-title">{document.name}</h4>
        <span className="slo-grid-item-header-type">
          {sloIndicatorLabelLookup({ value: document.indicator })}
        </span>
        {document.description !== undefined && (
          <Tooltip
            className="document-description-button"
            text={document.description}
          >
            <Button
              sizeType={Button.SIZE_TYPE.SMALL}
              type={Button.TYPE.PLAIN_NEUTRAL}
              iconType={Button.ICON_TYPE.INTERFACE__INFO__HELP}
            />
          </Tooltip>
        )}

        <SettingsMenu>
          <li
            className="service-settings-dropdown-item"
            onClick={() => {
              toggleViewModal({
                document
              });
            }}
          >
            <Icon type={Icon.TYPE.INTERFACE__INFO__INFO} />
            View details
          </li>
          <li
            className="service-settings-dropdown-item destructive"
            onClick={() => deleteCallback(document)}
          >
            <Icon
              type={Icon.TYPE.INTERFACE__OPERATIONS__TRASH}
              color="#BF0016"
            />
            Delete
          </li>
        </SettingsMenu>
      </header>
      <div
        className={`slo-grid-item-section section-current ${
          document.current < document.target ? 'status-poor' : 'status-good'
        }`}
      >
        <span className="slo-grid-item-section-value">{document.current}</span>
        <span className="slo-grid-item-section-label">Current</span>
      </div>
      <div className="slo-grid-item-section section-tag">
        <div className="slo-grid-item-section-value">{document.slogroup}</div>
        <span className="slo-grid-item-section-label">
          {document.slogroup ? 'SLO Group' : 'Tag'}
        </span>
      </div>
      <div
        className={`slo-grid-item-section section-7day ${
          document['7_day'] < document.target ? 'status-poor' : ''
        }`}
      >
        <span className="slo-grid-item-section-value">{document['7_day']}</span>
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
        <span className="slo-grid-item-section-value">{document.target}</span>
        <span className="slo-grid-item-section-label">target</span>
      </div>
    </GridItem>
  );
};

export default SloGridTags;

SloGridTags.propTypes = {
  document: PropTypes.object,
  toggleViewModal: PropTypes.func,
  toggleUpdateModal: PropTypes.func,
  deleteCallback: PropTypes.func,
  index: PropTypes.number
};

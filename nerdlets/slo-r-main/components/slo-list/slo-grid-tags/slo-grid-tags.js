import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
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
  const sevenDaysWrapperClasses = classNames('wrapper', {
    'wrapper--not-good': document['7_day'] < document.target
  });
  const sevenDaysLabelClasses = classNames('label', {
    'label--not-good': document['7_day'] < document.target
  });
  const sevenDaysValueClasses = classNames('value', {
    'value--not-good': document['7_day'] < document.target
  });

  const thirtyDaysWrapperClasses = classNames('wrapper', {
    'wrapper--not-good': document['30_day'] < document.target
  });
  const thirtyDaysLabelClasses = classNames('label', {
    'label--not-good': document['30_day'] < document.target
  });
  const thirtyDaysValueClasses = classNames('value', {
    'value--not-good': document['30_day'] < document.target
  });

  const currentWrapperClasses = classNames('wrapper', {
    'wrapper--not-good': document.current < document.target,
    'wrapper--all-good': !(document.current < document.target)
  });
  const currentLabelClasses = classNames('label', {
    'label--not-good': document.current < document.target,
    'label--all-good': !(document.current < document.target)
  });
  const currentValueClasses = classNames('value', {
    'value--not-good': document.current < document.target,
    'value--all-good': !(document.current < document.target)
  });

  const tags =
    document.tags &&
    document.tags.map(tag => (
      <span key={tag.key} className="tag">
        <span className="tag__value">{tag.values[0]}</span>
        <span className="tag__extended">{`${tag.key}=${tag.values[0]}`}</span>
      </span>
    ));

  let tooltip;

  if (document.description) {
    tooltip = (
      <Tooltip text={document.description}>
        <Button
          className="document-description-button"
          sizeType={Button.SIZE_TYPE.SMALL}
          type={Button.TYPE.PLAIN_NEUTRAL}
          iconType={Button.ICON_TYPE.INTERFACE__INFO__HELP}
        />
      </Tooltip>
    );
  }

  return (
    <GridItem className="slo-grid-item-tag" key={index} columnSpan={3}>
      {tooltip}
      <header className="slo-grid-item-tag__header">
        <h4 className="name">{document.name}</h4>
        <p className="indicator">
          {sloIndicatorLabelLookup({ value: document.indicator })}
        </p>

        <SettingsMenu>
          <li
            className="service-settings-dropdown-item"
            onClick={() => {
              toggleViewModal({ document });
            }}
          >
            <Icon type={Icon.TYPE.INTERFACE__INFO__INFO} />
            View details
          </li>
          <li
            className="service-settings-dropdown-item"
            onClick={() => {
              toggleUpdateModal({ document });
            }}
          >
            <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__EDIT} />
            Edit
          </li>
          <li
            className="service-settings-dropdown-item destructive"
            onClick={() => {
              deleteCallback(document);
            }}
          >
            <Icon
              type={Icon.TYPE.INTERFACE__OPERATIONS__TRASH}
              color="#BF0016"
            />
            Delete
          </li>
        </SettingsMenu>
      </header>
      <div className="slo-grid-item-tag__current">
        <div className={currentWrapperClasses}>
          <p className={currentValueClasses}>{document.current}</p>
          <p className={currentLabelClasses}>Current</p>
        </div>
      </div>
      <div className="slo-grid-item-tag__sevendays">
        <div className={sevenDaysWrapperClasses}>
          <p className={sevenDaysValueClasses}>{document['7_day']}</p>
          <p className={sevenDaysLabelClasses}>7 day</p>
        </div>
      </div>
      <div className="slo-grid-item-tag__thirtydays">
        <div className={thirtyDaysWrapperClasses}>
          <p className={thirtyDaysValueClasses}>{document['30_day']}</p>
          <p className={thirtyDaysLabelClasses}>30 day</p>
        </div>
      </div>
      <div className="slo-grid-item-tag__target">
        <div className="wrapper">
          <p className="value">{document.target}</p>
          <p className="label">target</p>
        </div>
      </div>
      <div className="slo-grid-item-tag__budget">
        <div className="wrapper">
          <p className="value">{document.budget}</p>
          <p className="label">Budget Remaining</p>
        </div>
      </div>
      <div className="slo-grid-item-tag__tags">{tags}</div>
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

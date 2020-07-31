import React from 'react';
import PropTypes from 'prop-types';
import { sloIndicatorLabelLookup } from '../../../shared/helpers';

const SloList = ({ slos, selectedSlosIds, handleSloClick }) => {
  return (
    <>
      <div className="slos-container__header">SLOs</div>
      <ul className="slos-container__list">
        {slos.map(({ id, document }) => {
          const isSelected = selectedSlosIds.includes(id);
          return (
            <li
              onClick={() => handleSloClick(id, isSelected)}
              className={`slo ${isSelected && 'slo--active'}`}
              key={id}
            >
              {document.name}
              <span className="slo__indicator">
                {sloIndicatorLabelLookup({
                  value: document.indicator
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
};

SloList.propTypes = {
  slos: PropTypes.array.isRequired,
  selectedSlosIds: PropTypes.array.isRequired,
  handleSloClick: PropTypes.func.isRequired
};

export default SloList;

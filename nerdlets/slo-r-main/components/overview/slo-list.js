import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'nr1';
import { sloIndicatorLabelLookup } from '../../../shared/helpers';

const SloList = ({ slos, selectedSlosIds, handleSloClick }) => {
  return (
    <>
      <div className="slos-container__header">SLOs</div>
      <ul className="slos-container__list">
        {slos.map(({ id, document }) => {
          const isSelected = selectedSlosIds.includes(id);

          let tags;
          if (document.tags) {
            tags = document.tags.map(tag => {
              return (
                <Tooltip key={tag.key} text={`${tag.key}=${tag.values[0]}`}>
                  <span className="slo__tag" key={tag.key}>
                    {tag.values[0]}
                  </span>
                </Tooltip>
              );
            });
          }

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
              {tags ? <div className="slo__tags">{tags}</div> : null}
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

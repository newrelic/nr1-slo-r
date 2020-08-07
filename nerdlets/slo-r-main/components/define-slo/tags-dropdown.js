import React from 'react';
import PropTypes from 'prop-types';
import { Multiselect } from 'react-widgets';

const TagsDropdown = ({ tags, selectedTags, handleTagChange, disabled }) => {
  return (
    <>
      <h4 className="dropdown-label">Tags</h4>
      <Multiselect
        style={{ marginBottom: '15px' }}
        data={tags}
        textField={entityTag => `${entityTag.key}=${entityTag.values[0]}`}
        valueField={entityTag => `${entityTag.key}=${entityTag.values[0]}`}
        value={selectedTags}
        onChange={value => {
          handleTagChange(value);
        }}
        disabled={Boolean(disabled)}
      />
    </>
  );
};

TagsDropdown.propTypes = {
  tags: PropTypes.array,
  selectedTags: PropTypes.array,
  handleTagChange: PropTypes.func,
  disabled: PropTypes.bool
};

export default TagsDropdown;

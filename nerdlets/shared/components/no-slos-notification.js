import React from 'react';
import PropTypes from 'prop-types';
import { EmptyState } from '@newrelic/nr1-community';
import { Button } from 'nr1';

const descriptionStyle = {
  display: 'blick'
};

const descriptionButtonStyle = {
  display: 'block',
  margin: '10px 0'
};

const NoSlosNotification = ({ handleClick }) => {
  const noSloDescription = () => (
    <span style={descriptionStyle}>
      It looks like no SLOs have been defined for this entity. To get started,
      define an SLO using the button below and follow the instructions. For more
      information please see the{' '}
      <a
        href="https://github.com/newrelic/nr1-slo-r"
        target="_blank"
        rel="noopener noreferrer"
      >
        documentation
      </a>
      . We also have documentation for more specific information about{' '}
      <a
        href="https://github.com/newrelic/nr1-slo-r/blob/master/docs/error_slos.md"
        target="_blank"
        rel="noopener noreferrer"
      >
        error driven SLOs
      </a>{' '}
      or{' '}
      <a
        href="https://github.com/newrelic/nr1-slo-r/blob/master/docs/alert_slos.md"
        target="_blank"
        rel="noopener noreferrer"
      >
        alert driven SLOs
      </a>
      <span style={descriptionButtonStyle}>
        <Button
          type={Button.TYPE.PRIMARY}
          iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
          onClick={handleClick}
        >
          Define an SLO
        </Button>
      </span>
    </span>
  );

  return (
    <EmptyState
      buttonText=""
      heading="Get started"
      description={noSloDescription()}
    />
  );
};

NoSlosNotification.propTypes = {
  handleClick: PropTypes.func
};

export default NoSlosNotification;

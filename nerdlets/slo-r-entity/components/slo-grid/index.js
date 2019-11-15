import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, GridItem, Button } from 'nr1';

export default class SLOGrid extends Component {

    static propTypes = {
        data: PropTypes.array,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const data = this.props.data;


        // todo: The color coding for 7 and 30 day are not working. Fix that.
        const SLOGridItems = data.map((sloData, index) => {
            return (
                <GridItem className="slo-grid-item" key={index} columnSpan={3}>
                    <header className="slo-grid-item-header">
                        <h4 className="slo-grid-item-header-title">{sloData.name}</h4>
                        <span className="slo-grid-item-header-type">{sloData.type}</span>
                        <Button
                            sizeType={Button.SIZE_TYPE.SMALL}
                            type={Button.TYPE.NORMAL}
                            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__MORE}
                            className="slo-grid-item-section-settings-button"
                        />
                    </header>
                    <div className={`slo-grid-item-section section-current ${sloData.current < sloData.target ? 'status-poor' : 'status-good'}`}>
                        <span className="slo-grid-item-section-value">{sloData.current}</span>
                        <span className="slo-grid-item-section-label">Current</span>
                    </div>
                    <div className="slo-grid-item-section section-org">
                        <span className="slo-grid-item-section-value">{sloData.org}</span>
                        <span className="slo-grid-item-section-label">Org</span>
                    </div>
                    <div className={`slo-grid-item-section section-7day ${sloData.sevenDay < sloData.target ? 'status-poor' : ''}`}>
                        <span className="slo-grid-item-section-value">{sloData.sevenDay}</span>
                        <span className="slo-grid-item-section-label">7 day</span>
                    </div>
                    <div className={`slo-grid-item-section section-30day ${sloData.thirtyDay < sloData.target ? 'status-poor' : ''}`}>
                        <span className="slo-grid-item-section-value">{sloData.thirtyDay}</span>
                        <span className="slo-grid-item-section-label">30 day</span>
                    </div>
                    <div className="slo-grid-item-section section-target">
                        <span className="slo-grid-item-section-value">{sloData.target}</span>
                        <span className="slo-grid-item-section-label">target</span>
                    </div>
                </GridItem>
            )
        })

        return (
            <Grid className="slo-grid-container" spacingType={[Grid.SPACING_TYPE.SMALL, Grid.SPACING_TYPE.EXTRA_LARGE]} fullHeight>
                {SLOGridItems}
            </Grid>
        );
    } //render

}

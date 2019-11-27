/**
 * Provides full New Relic One SLO/R Entity functionality.
 *
 * @file This files defines the NR1 App SLO/R Entity functionaly and loads dedicated elements to define and display SLOs.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import {
  Button,
  EntityStorageMutation,
  Grid,
  GridItem,
  navigation,
  Stack,
  StackItem,
  Spinner,
  PlatformStateContext,
  NerdletStateContext,
  Icon
} from 'nr1';
/** shared */

// slo documents
import { fetchSloDocuments } from '../shared/services/slo-documents';

/** local */
import SLOTable from './components/slo-table';
import SloForm from './components/slo-form';
import ModalWrapper from './components/modal-wrapper';

/**
 * SLOREntityNerdlet
 */
export default class SLOREntityNedlet extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      entityGuid: this.props.nerdletUrlState.entityGuid,
      slo_documents: null,
      SLOTableView: false,

      // New SLO
      isActiveCreateModal: false,
      isActiveUpdateModal: false,

      // Update SLO
      editDocumentId: null,

      // UI State
      refresh: false
    }; // state

    this.openConfig = this._openConfig.bind(
      this
    ); /** opens the SLO configuration */

    this.createDocumentCallback = this.createDocumentCallback.bind(this);
    this.updateDocumentCallback = this.updateDocumentCallback.bind(this);
    this.deleteDocumentCallback = this.deleteDocumentCallback.bind(this);

    this.toggleCreateModal = this.toggleCreateModal.bind(this);
    this.toggleUpdateModal = this.toggleUpdateModal.bind(this);
  } // constructor

  /** lifecycle prompts the fetching of the SLO documents for this entity */
  componentDidMount() {
    this.load();
  } // componentDidMount

  /*
   * Reload if we changed entityGuid or triggered a refresh
   */
  componentDidUpdate(prevProps) {
    if (
      prevProps.nerdletUrlState.entityGuid !==
        this.props.nerdletUrlState.entityGuid ||
      this.state.refresh
    ) {
      this.load();
    }
    // console.debug(this.state.isActiveCreateModal);
  }

  static contextType = NerdletStateContext;

  async load() {
    // TO DO - setState and then load in callback, or load and then setState??
    this._getSLODocuments();

    if (this.state.refresh) {
      this.setState({ refresh: false });
    }
  }

  /** opens the slo-r configuration nerdlet */
  _openConfig() {
    const __confignerdlet = {
      id: 'slo-r-config',
      urlState: {
        entityGuid: this.state.entityGuid,
        renderCallback: this.rerenderSLOs
      }
    };

    navigation.openStackedNerdlet(__confignerdlet);
  } // openConfig

  /** gets all the SLO documents defined for this entity */
  async _getSLODocuments() {
    const { entityGuid } = this.state;

    const slo_documents = await fetchSloDocuments({ entityGuid });
    this.setState({ slo_documents });
  } // _getSLODocuments

  toggleCreateModal() {
    this.setState(prevState => ({
      isActiveCreateModal: !prevState.isActiveCreateModal
    }));
  }

  toggleUpdateModal(options = { document: {} }) {
    const idField = 'name'; // TO DO - Why is our "id" field the user definable "name"?
    const { document } = options;
    const documentId = document[idField] || undefined;

    this.setState(prevState => {
      return {
        isActiveUpdateModal: !prevState.isActiveUpdateModal,
        editDocumentId: documentId
      };
    });
  }

  // Form Callbacks
  async createDocumentCallback({ document, response }) {
    if (!response) {
      throw new Error('Error writing SLO Document to Entity Storage');
    }

    this.addDocumentToList({ mutationResult: document });
    // this.setState({ isActiveCreateModal: false, refresh: true });
  }

  async updateDocumentCallback({ document, response }) {
    if (!response) {
      throw new Error('Error updating SLO Document to Entity Storage');
    }

    this.updateDocumentInList({ mutationResult: document });
  }

  async deleteDocumentCallback({ document }) {
    const __mutation = {
      actionType: EntityStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: 'nr1-csg-slo-r',
      entityGuid: document.entityGuid,
      documentId: document.name || document.slo_name
    }; // mutation

    // TODO Provide message of the successful deletion
    const __result = await EntityStorageMutation.mutate(__mutation);

    if (!__result) {
      throw new Error('Error deleting SLO document from Entity Storage');
    }

    this.removeDocumentFromList({ document });
    // this.setState({ refresh: true });
  }

  addDocumentToList({ mutationResult }) {
    const { documentId, document } = mutationResult;
    const newRecords = [{ id: documentId, document }];
    this.setState(prevState => ({
      slo_documents: prevState.slo_documents.concat(newRecords),
      isActiveCreateModal: false
    }));
  }

  updateDocumentInList({ mutationResult }) {
    //
  }

  removeDocumentFromList({ document }) {
    this.setState(prevState => ({
      slo_documents: prevState.slo_documents.filter(
        doc => doc.document.name !== document.name
      )
    }));
  }

  /** lifecycle provides the rendering context for this nerdlet */
  render() {
    // ensure we have state for our slo documents to render the reporting table and configuration options

    if (this.state.slo_documents === null) {
      return (
        <div>
          <Spinner className="centered" size="small" />
        </div>
      );
    } // if
    else {
      const sloHasBeenDefined = this.state.slo_documents.length > 0;

      return (
        <div>
          <Stack
            className="toolbar-container"
            fullWidth
            horizontalType={Stack.HORIZONTAL_TYPE.FILL}
            verticalType={Stack.VERTICAL_TYPE.CENTER}
            gapType={Stack.GAP_TYPE.NONE}
          >
            <StackItem className="toolbar-left-side">
              <div className="segmented-control-container">
                <button
                  type="button"
                  className={`grid-view-button ${
                    !this.state.SLOTableView ? 'active' : ''
                  }`}
                  onClick={() => this.setState({ SLOTableView: false })}
                >
                  <Icon
                    type={Icon.TYPE.INTERFACE__OPERATIONS__GROUP}
                    color={this.state.SLOTableView ? '#007e8a' : '#ffffff'}
                  />
                  Grid
                </button>
                <button
                  type="button"
                  className={`table-view-button ${
                    this.state.SLOTableView ? 'active' : ''
                  }`}
                  onClick={() => this.setState({ SLOTableView: true })}
                >
                  <Icon
                    type={Icon.TYPE.INTERFACE__VIEW__LIST_VIEW}
                    color={this.state.SLOTableView ? '#ffffff' : '#007e8a'}
                  />
                  Table
                </button>
              </div>

              <hr />
            </StackItem>
            <StackItem>
              <Stack
                className="toolbar-right-side"
                fullWidth
                horizontalType={Stack.HORIZONTAL_TYPE.RIGHT}
              >
                <Button
                  onClick={this.toggleCreateModal}
                  type={Button.TYPE.PRIMARY}
                  iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
                >
                  Define an SLO
                </Button>
              </Stack>
            </StackItem>
          </Stack>
          <Grid
            className={
              !sloHasBeenDefined ? 'no-slos-exist' : 'slo-table-container'
            }
          >
            <GridItem
              columnSpan={!sloHasBeenDefined ? 4 : 12}
              columnStart={!sloHasBeenDefined ? 5 : null}
            >
              <PlatformStateContext.Consumer>
                {launcherUrlState => (
                  <SLOTable
                    entityGuid={this.state.entity}
                    slo_documents={this.state.slo_documents}
                    timeRange={launcherUrlState.timeRange}
                    toggleCreateModal={this.toggleCreateModal}
                    toggleUpdateModal={this.toggleUpdateModal}
                    tableView={this.state.SLOTableView}
                    deleteCallback={this.deleteDocumentCallback}
                  />
                )}
              </PlatformStateContext.Consumer>
            </GridItem>
          </Grid>

          {/* Create Modal */}
          <ModalWrapper
            modalIsActive={this.state.isActiveCreateModal}
            modalToggleCallback={this.toggleCreateModal}
          >
            <SloForm
              entityGuid={this.state.entityGuid}
              createDocumentCallback={this.createDocumentCallback}
              modalToggleCallback={this.toggleCreateModal}
            />
          </ModalWrapper>

          {/* Update Modal */}
          <ModalWrapper
            modalIsActive={this.state.isActiveUpdateModal}
            modalToggleCallback={this.toggleUpdateModal}
          >
            <SloForm
              entityGuid={this.state.entityGuid}
              documentId={this.state.editDocumentId}
              updateDocumentCallback={this.updateDocumentCallback}
              modalToggleCallback={this.toggleUpdateModal}
            />
          </ModalWrapper>
        </div>
      );
    } // else
  } // render
} // SLOREntityNedlet

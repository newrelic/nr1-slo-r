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
  Icon,
  Modal,
  navigation,
  NerdletStateContext,
  PlatformStateContext,
  Stack,
  StackItem,
  Spinner
} from 'nr1';
/** shared */

// slo documents
import { fetchSloDocuments } from '../shared/services/slo-documents';

/** local */
import SloList from './components/slo-list';
import SloForm from './components/slo-form';
import ViewDocument from './components/view-document';

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
      isActiveViewModal: false,

      // Update SLO
      editDocumentId: null,

      // View SLO
      viewDocumentId: null,

      // UI State
      refresh: false
    }; // state

    this.openConfig = this._openConfig.bind(
      this
    ); /** opens the SLO configuration */

    this.upsertDocumentCallback = this.upsertDocumentCallback.bind(this);
    this.deleteDocumentCallback = this.deleteDocumentCallback.bind(this);

    this.toggleCreateModal = this.toggleCreateModal.bind(this);
    this.toggleUpdateModal = this.toggleUpdateModal.bind(this);
    this.toggleViewModal = this.toggleViewModal.bind(this);
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
    const idField = 'documentId';
    const { document } = options;
    const documentId = document[idField] || null;

    this.setState(prevState => {
      return {
        isActiveUpdateModal: !prevState.isActiveUpdateModal,
        editDocumentId: documentId
      };
    });
  }

  toggleViewModal(options = { document: {} }) {
    const { document } = options;

    this.setState(prevState => ({
      viewDocumentId: document.documentId,
      isActiveViewModal: !prevState.isActiveViewModal
    }));
  }

  // Form Callbacks
  async upsertDocumentCallback({ document, response }) {
    if (!response) {
      throw new Error('Error writing SLO Document to Entity Storage');
    }

    this.upsertDocumentInList({ mutationResult: document });
  }

  async deleteDocumentCallback({ document }) {
    const __mutation = {
      actionType: EntityStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: 'nr1-csg-slo-r',
      entityGuid: document.entityGuid,

      // TO DO - Remove document.name and document.slo_name after we've reached an initial release
      documentId: document.documentId || document.name || document.slo_name
    };

    // TODO Provide message of the successful deletion
    const __result = await EntityStorageMutation.mutate(__mutation);

    if (!__result) {
      throw new Error('Error deleting SLO document from Entity Storage');
    }

    this.removeDocumentFromList({ document });
    // this.setState({ refresh: true });
  }

  upsertDocumentInList({ mutationResult }) {
    const { slo_documents } = this.state;
    const { documentId, document } = mutationResult;

    const documentIndex = slo_documents.findIndex(
      d => d.document.documentId === mutationResult.documentId
    );

    // Update item in list without mutating state
    if (documentIndex >= 0) {
      this.setState(({ slo_documents }) => ({
        slo_documents: [
          ...slo_documents.slice(0, documentIndex),
          { id: documentId, document },
          ...slo_documents.slice(documentIndex + 1)
        ],
        isActiveUpdateModal: false
      }));
    }

    if (documentIndex < 0) {
      const newRecords = [{ id: documentId, document }];
      this.setState(prevState => ({
        slo_documents: prevState.slo_documents.concat(newRecords),
        isActiveCreateModal: false
      }));
    }
  }

  removeDocumentFromList({ document }) {
    this.setState(prevState => ({
      slo_documents: prevState.slo_documents.filter(doc => {
        return doc.document.documentId !== document.documentId;
      })
    }));
  }

  renderToolbar() {
    return (
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
    );
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
    }

    const sloHasBeenDefined = this.state.slo_documents.length > 0;

    return (
      <div>
        {this.renderToolbar()}
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
              {launcherUrlState => {
                if (this.state.slo_documents === null) {
                  return null;
                }

                return (
                  <SloList
                    entityGuid={this.state.entity}
                    slo_documents={this.state.slo_documents}
                    timeRange={launcherUrlState.timeRange}
                    toggleCreateModal={this.toggleCreateModal}
                    toggleUpdateModal={this.toggleUpdateModal}
                    toggleViewModal={this.toggleViewModal}
                    tableView={this.state.SLOTableView}
                    deleteCallback={this.deleteDocumentCallback}
                  />
                );
              }}
            </PlatformStateContext.Consumer>
          </GridItem>
        </Grid>

        {/* Create Modal */}
        <Modal
          hidden={!this.state.isActiveCreateModal}
          onClose={() => this.setState({ isActiveCreateModal: false })}
        >
          <PlatformStateContext.Consumer>
            {launcherUrlState => {
              return (
                <SloForm
                  entityGuid={this.state.entityGuid}
                  upsertDocumentCallback={this.upsertDocumentCallback}
                  modalToggleCallback={this.toggleCreateModal}
                  timeRange={launcherUrlState.timeRange}
                />
              );
            }}
          </PlatformStateContext.Consumer>
        </Modal>

        {/* Update Modal */}
        <Modal
          hidden={!this.state.isActiveUpdateModal}
          onClose={() => this.setState({ isActiveUpdateModal: false })}
        >
          <SloForm
            entityGuid={this.state.entityGuid}
            documentId={this.state.editDocumentId}
            upsertDocumentCallback={this.upsertDocumentCallback}
            modalToggleCallback={this.toggleUpdateModal}
          />
        </Modal>

        {/* View Modal */}
        <Modal
          hidden={!this.state.isActiveViewModal}
          onClose={() => this.setState({ isActiveViewModal: false })}
        >
          <ViewDocument
            entityGuid={this.state.entityGuid}
            documentId={this.state.viewDocumentId}
          />
        </Modal>
      </div>
    );
  } // render
} // SLOREntityNedlet

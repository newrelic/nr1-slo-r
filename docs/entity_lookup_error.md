# Entity Lookup Error
  
It has been reported from time to time the SLO/R Entity Nerdlet will fail to appropriately load the current entity in the Entity Explorer. When this situation occurs there is no entity guid from which to lookup existing or bind new SLO documents.

As of release 1.7.2 we have included an Alert popup indicating that the target entity did not load. That popup points users to this page. We are working on an fix to this issue and you can follow along with the progress of [issue 137](https://github.com/newrelic/nr1-slo-r/issues/137).

At present the only workaround for this situation is as follows: 
 
- From the New Relic Apps Catalog select the SLO/R application and open the the SLO/R launcher.
- Select the "App Details" option in the upper right-hand corner of the launcher.
- Select "Manage access" option.
- Deselect the SLO/R application from the Account that is encountering the entity lookup failure. This will unsubscribe the app from the account. 
- Click the "Update n accounts" button in the upper right-hand corner of the catalog.
- Go back to your account and verify that SLO/R has been removed.
- At this point you can re-add SLO/R to your account and try again to load existing SLOs or create new ones. 

If you continue to have problems, please add a comment on [issue 137](https://github.com/newrelic/nr1-slo-r/issues/137), or [open a new issue](https://github.com/newrelic/nr1-slo-r/issues/new/choose) so we can track appearance of this bug. 

We hope to have a fix soon. 

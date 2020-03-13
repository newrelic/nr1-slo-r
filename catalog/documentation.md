## Usage

SLO/R lets you quickly define SLOs for **error**, **availability**, **capacity**, and **latency** conditions.

You can use the application for reporting out your results.

By measuring SLO attainment across your service estate, you’ll be able to determine what signals are most important.

Using New Relic as a consistent basis to define and measure your SLOs offers better insight into comparative SLO attainment in your service delivery organization.

SLO/R provides two mechanisms for calculating SLOs: **error type** (calculated by defects on transactions) and **availability**, **capacity**, and **latency type** (calculated by total duration of alert violation).

> We are keen to see SLO/R evolve and grow to include additional features and visualizations. For version 1.0.1, we wanted to ship the core SLO calculation capabilities. We expect to rapidly build upon this core functionality through several releases. Please add an issue to the repo is there's a feature you'd like to see.
> For more details about the SLOs and their calculations, please see [error driven SLOs](https://github.com/newrelic/nr1-slo-r/blob/master/docs/error_slos.md) and [alert driven SLOs](https://github.com/newrelic/nr1-slo-r/blob/master/docs/alert_slos.md).

## Open source license

This project is distributed under the [Apache 2 license](https://github.com/newrelic/nr1-slo-r/blob/master/LICENSE).

## Dependencies

Requires [`New Relic APM`](https://newrelic.com/products/application-monitoring).

SLO/R is intended to work specifically with services reporting to New Relic via an APM Agent. The service provides an entity upon which to define SLOs.

- `Error-based SLO’s` work with [APM Transaction data](https://docs.newrelic.com/docs/insights/insights-data-sources/default-data/apm-default-events-insights).
- `Alert-based SLO’s` require a custom webhook configured to write `SLOR_ALERTS` events to NRDB. See [Configuring SLO/R Alert Webhook](https://github.com/newrelic/nr1-slo-r#configuring-slor-alert-webhook) for specific instructions.

## Getting started

1. First, ensure that you have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [NPM](https://www.npmjs.com/get-npm) installed. If you're unsure whether you have one or both of them installed, run the following command(s) (If you have them installed these commands will return a version number, if not, the commands won't be recognized):

   ```bash
   git --version
   npm -v
   ```

2. Next, install the [New Relic One CLI](https://one.newrelic.com/launcher/developer-center.launcher) by going to [this link](https://one.newrelic.com/launcher/developer-center.launcher) and following the instructions (5 minutes or less) to install and set up your New Relic development environment.
3. Next, to clone this repository and run the code locally against your New Relic data, execute the following command:

   ```bash
   nr1 nerdpack:clone -r https://github.com/newrelic/nr1-slo-r.git
   cd nr1-slo-r
   nr1 nerdpack:serve
   ```

Visit [https://one.newrelic.com/?nerdpacks=local](https://one.newrelic.com/?nerdpacks=local), navigate to the Nerdpack, and :sparkles:

## Deploying this Nerdpack

Open a command prompt in the nerdpack's directory and run the following commands.

```bash
# To create a new uuid for the nerdpack so that you can deploy it to your account:
nr1 nerdpack:uuid -g [--profile=your_profile_name]

# To see a list of APIkeys / profiles available in your development environment:
# nr1 profiles:list
nr1 nerdpack:publish [--profile=your_profile_name]
nr1 nerdpack:deploy [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
nr1 nerdpack:subscribe [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
```

Visit [https://one.newrelic.com](https://one.newrelic.com), navigate to the Nerdpack, and :sparkles:

## Configuring SLO/R Alert Webhook

The availability, capacity, and latency SLO types within SLO/R are calculated using the total duration of alert violations. In order to record those alert violations we need to enable an Insights directed Webhook to capture the `open` and `close` events.

The alert payload needs to be as specified for SLO/R to operate as expected. Please follow [these instructions](https://github.com/newrelic/nr1-slo-r/blob/master/docs/slor_alerts_config.md) to enable the alert event forwarding.

For more information on sending alert data to New Relic, see [Sending Alerts data to New Relic](https://blog.newrelic.com/product-news/sending-alerts-data-to-insights/).

## How to configure and use SLO/R

SLO definitions are scoped and stored with service entities. Open a service entity by exploring your services in the [Entity explorer](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/ui-data/new-relic-one-entity-explorer-view-performance-across-apps-services-hosts) from the [New Relic One homepage](https://one.newrelic.com).

Select the service you are interested in creating SLOs for. In our example we will be using the Origami Portal Service.

Select the SLO/R New Relic One app from the left-hand navigation in your entity.

If you (or others) haven't configured an SLO the canvas will be empty. Just click on the **Define an SLO** button to begin configuring your first SLO.

The UI will open a side-panel to facilitate configuration. Fill in the fields:

- SLO Name: Give your SLO a name, this has to be unique for the service or will overwrite similarly named SLOs for this entity.
- Description: Give a quick overview of what you're basing this SLO on.
- SLO Group: This is grouping meta-data. Typically organizations are responsible for multiple services and SLOs. This gives us an ability to roll up the SLO to an organizational attainment.
- Target attainment: The numeric value as a percentage, you wish as your SLO target (e.g. 99.995)
- Indicator: There are four indicators for SLOs in SLO/R - **Error**, **Availability**, **Capacity**, and **Latency**. Error SLOs are calculated from _Transaction_ event defects. Availability, latency, and capacity SLOs are calculated by alert violations.

Example error SLO

For **Error** SLOs you need to define the defects you wish to measure and the transaction names you want to associate with this SLO.

Example Availability SLO

Alert driven SLOs depend on alert events being reported in the SLOR_ALERTS table. Please see [SLO/R alerts config](https://github.com/newrelic/nr1-slo-r/blob/master/docs/slor_alerts_config.md) to ensure you're set up to capture alert events.

Once you've created a few SLOs you should see a view like the following:

### How is SLO/R arriving at the SLO calculations?

For details, see [Alert SLOs](https://github.com/newrelic/nr1-slo-r/blob/master/docs/alert_slos.md) and [Error SLOs](https://github.com/newrelic/nr1-slo-r/blob/master/docs/error_slos.md).

## Community Support

New Relic hosts and moderates an online forum where you can interact with New Relic employees as well as other customers to get help and share best practices. Like all New Relic open source community projects, there's a related topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

[https://discuss.newrelic.com/t/track-your-service-level-objectives-with-the-slo-r-nerdpack/90046](https://discuss.newrelic.com/t/track-your-service-level-objectives-with-the-slo-r-nerdpack/90046)

Please do not report issues with SLO/R to New Relic Global Technical Support. Instead, visit the [`Explorers Hub`](https://discuss.newrelic.com/c/build-on-new-relic) for troubleshooting and best-practices.

## Issues and enhancement requests

Issues and enhancement requests can be submitted in the [Issues tab of this repository](https://github.com/newrelic/nr1-slo-r/issues). Please search for and review the existing open issues before submitting a new issue.

## Contributing

Contributions are welcome (and if you submit an enhancement request, expect to be invited to contribute it yourself :grin:). Please review our [contributors guide](https://github.com/newrelic/nr1-slo-r/blob/master/CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource+nr1-slo-r@newrelic.com.

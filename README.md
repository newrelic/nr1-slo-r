
![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/newrelic/nr1-slo-r?include_prereleases&sort=semver) [![Snyk](https://snyk.io/test/github/newrelic/nr1-slo-r/badge.svg)](https://snyk.io/test/github/newrelic/nr1-slo-r)

## Usage

SLO/R is a [New Relic One open source app](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/build-new-relic-one/new-relic-one-build-your-own-custom-new-relic-one-application) that calculates service-level objective (SLO) attainment and reports on it for a service. It lets you quickly define SLOs for error, availability, capacity, and latency conditions. You can use the application for reporting out your results. (SLO/R - "service-level objectives and reporting")

By measuring SLO attainment across your service estate, you'll be able to determine what signals are most important for a given service, or set of services, developed and supported by a team/organization. Using New Relic as a consistent basis to define and measure your SLOs offers better insight into comparative SLO attainment in your service delivery organization.

We are keen to see SLO/R evolve and grow to include additional features and visualizations. For version 1.0.1, we wanted to ship the core SLO calculation capabilities. We expect to rapidly build upon this core functionality through several releases. Please add an issue to the repo is there's a feature you'd like to see.

SLO/R provides two mechanisms for calculating SLOs: **error type** (calculated by defects on transactions) and **availability**, **capacity**, and **latency type** (calculated by total duration of alert violation).

- For more details about the SLOs and their calculations, please see [error driven SLOs](./docs/error_slos.md) and [alert driven SLOs](./docs/alert_slos.md).

![Screenshot #1](screenshots/screenshot_05.png)

## Open source license

This project is distributed under the [Apache 2 license](LICENSE).

## What do you need to make this work?

Required:

- [New Relic APM agent(s) installed](https://docs.newrelic.com/docs/agents/manage-apm-agents/installation/compatibility-requirements-new-relic-agents-products).
- SLO/R is intended to work specifically with services reporting to New Relic via an APM Agent. The service provides an entity upon which to define SLOs. Error budget SLOs are defined directly from [APM *Transaction* events](https://docs.newrelic.com/docs/insights/insights-data-sources/default-data/apm-default-events-insights), the other SLO types are defined using New Relic Alerts (see "Configuring SLOR alert webhook" section below).
- A New Relic Alerts webhook to forward alert events to a SLOR_ALERTS New Relic database table. See "Configuring SLOR alert webhook" section for more details.


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
# If you need to create a new uuid for the account to which you're deploying this Nerdpack, use the following
# nr1 nerdpack:uuid -g [--profile=your_profile_name]
# to see a list of APIkeys / profiles available in your development environment, run nr1 credentials:list
nr1 nerdpack:publish [--profile=your_profile_name]
nr1 nerdpack:deploy [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
nr1 nerdpack:subscribe [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
```

Visit [https://one.newrelic.com](https://one.newrelic.com), navigate to the Nerdpack, and :sparkles:

## Creating a webhook to forward Alert incidents to Insights

The availability, capacity, and latency SLO types within SLO/R are calculated using the total duration of alert violations. In order to record those alert violations we need to enable an Insights directed Webhook to capture the _open_ and _close_ events. To enable this webhook please follow the steps below, the alert payload needs to be as specified for SLO/R to operate as expected. Please follow [these instructions](./docs/slor_alerts_config.md) to enable the alert event forwarding.


For more information on sending alert data to New Relic, see [Sending Alerts data to New Relic](https://blog.newrelic.com/product-news/sending-alerts-data-to-insights/).

## How to configure and use SLO/R

SLO definitions are scoped and stored with service entities. Open a service entity by exploring your services in the [entity explorer](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/ui-data/new-relic-one-entity-explorer-view-performance-across-apps-services-hosts) from the [New Relic One homepage](https://one.newrelic.com).

![Screenshot #6](screenshots/screenshot_06.png)

Select the service you are interested in creating SLOs for. In our example we will be using the Origami Portal Service.
![Screenshot #7](screenshots/screenshot_07.png)

Select the SLO/R New Relic One app from the left-hand navigation in your entity.
![Screenshot #16](screenshots/screenshot_16.png)


If you (or others) haven't configured an SLO the canvas will be empty. Just click on the **Define an SLO** button to begin configuring your first SLO.
![Screenshot #1](screenshots/screenshot_01.png)

The UI will open a side-panel to facilitate configuration. Fill in the fields:
- SLO Name: Give your SLO a name, this has to be unique for the service or will overwrite similarly named SLOs for this entity.
- Description: Give a quick overview of what you're basing this SLO on.
- Organization: This is grouping meta-data. Typically organizations are responsible for multiple services and SLOs. This gives us an ability to roll up the SLO to an organizational attainment.
- Target attainment: The numeric value as a percentage, you wish as your SLO target (e.g. 99.995)
- Indicator: There are four indicators for SLOs in SLO/R - **Error**, **Availability**, **Capacity**, and **Latency**. Error SLOs are calculated from *Transaction* event defects. Availability, latency, and capacity SLOs are calculated by alert violations.

Example error SLO
![Screenshot #3](screenshots/screenshot_03.png)

For **Error** SLOs you need to define the defects you wish to measure and the transaction names you want to associate with this SLO.

Example Availability SLO
![Screenshot #2](screenshots/screenshot_02.png)

Alert driven SLOs depend on alert events being reported in the SLOR_ALERTS table. Please see [SLO/R alerts config](./docs/slor_alerts_config.md) to ensure you're set up to capture alert events.


Once you've created a few SLOs you should see a view like the following:

![Screenshot #4](screenshots/screenshot_04.png)

### How is SLO/R arriving at the SLO calculations?

For details, see [Alert SLOs](./docs/alert_slos.md) and [Error SLOs](error_slos.md).

# Support

New Relic has open-sourced this project. This project is provided **AS-IS WITHOUT WARRANTY OR DEDICATED SUPPORT**. Issues and contributions should be reported to the project here on GitHub.

We encourage you to bring your experiences and questions to the [Explorers Hub](https://discuss.newrelic.com) where our community members collaborate on solutions and new ideas.

## Community

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

https://discuss.newrelic.com/t/track-your-service-level-objectives-with-the-slo-r-nerdpack/90046

## Issues and enhancement requests

Issues and enhancement requests can be submitted in the [Issues tab of this repository](../../issues). Please search for and review the existing open issues before submitting a new issue.

# Contributing

Contributions are welcome (and if you submit an enhancement request, expect to be invited to contribute it yourself :grin:). Please review our [contributors guide](CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource+nr1-slo-r@newrelic.com.

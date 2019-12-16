## [1.1.1](https://github.com/newrelic/nr1-slo-r/compare/v1.1.0...v1.1.1) (2019-12-16)


### Bug Fixes

* readability of code and error if no alerts provided ([7d8d1b3](https://github.com/newrelic/nr1-slo-r/commit/7d8d1b39779b4902ea879fefd64e12e3d136d885))

# [1.1.0](https://github.com/newrelic/nr1-slo-r/compare/v1.0.1...v1.1.0) (2019-12-13)


### Features

* add toggle buttons for indicators in summary ([ff75c33](https://github.com/newrelic/nr1-slo-r/commit/ff75c336c6c8f761828b532a323f769ac3706c44))

## [1.0.1](https://github.com/newrelic/nr1-slo-r/compare/v1.0.0...v1.0.1) (2019-12-13)


### Bug Fixes

* I made it so the empty state always appears ([484a674](https://github.com/newrelic/nr1-slo-r/commit/484a6742b3b0449ed5aa429768a64a77c1918954))

# 1.0.0 (2019-12-13)


### Bug Fixes

* document list update on delete ([e3afe2a](https://github.com/newrelic/nr1-slo-r/commit/e3afe2a136eabfcb2a76f01f950d6ae61d69036a))
* **SLO table:** add missing key prop ([acd9a3b](https://github.com/newrelic/nr1-slo-r/commit/acd9a3b23495707a2342c08eed9ff6e772639c4a))
* add in necessary styles for table col sorting ([7116476](https://github.com/newrelic/nr1-slo-r/commit/711647635a3c8c583af2141aef71ec7d8f4395d3))
* add the entirety of the document and reference org as organization ([3ee7d35](https://github.com/newrelic/nr1-slo-r/commit/3ee7d35a48653994f8a1d1fdb2d6e2081da52f38))
* alert-driven slo query generation ([7defcf0](https://github.com/newrelic/nr1-slo-r/commit/7defcf0e5ef4d31e209bb9371bb474a5a1d0bbcc))
* alertdriven slo import ([76bdd98](https://github.com/newrelic/nr1-slo-r/commit/76bdd98d3945d2436d9f68f2e62085f1c65a43b2))
* display form fields when no documentId, i.e. new records ([74d1915](https://github.com/newrelic/nr1-slo-r/commit/74d191517e34c1b242fbd0cbff53f085e81e55d9))
* edit document state issue, reset editDocumentId after closing modal ([1a2ba89](https://github.com/newrelic/nr1-slo-r/commit/1a2ba89288a0f3b992081c4d6df100b5a9215653))
* error in onClick function of slo type dropdown ([1397fe4](https://github.com/newrelic/nr1-slo-r/commit/1397fe458af9a55c8a05ba650a059dd939f1da99))
* funky empty state styling ([33f0d8c](https://github.com/newrelic/nr1-slo-r/commit/33f0d8ccbb3fe9cdf866816b32bc05a006d3694c))
* indicator column data now appears ([4ddd74e](https://github.com/newrelic/nr1-slo-r/commit/4ddd74ee34bd7a3ecb5b07e3338586acfa15eb45))
* invalid prop warning ([56ea512](https://github.com/newrelic/nr1-slo-r/commit/56ea512cceae17aa856373e9e141b12baa8b83b6))
* nrql for summary, map defects value and correct time range values ([8d9b3aa](https://github.com/newrelic/nr1-slo-r/commit/8d9b3aac56b687774ce9fd211191cafec391549f))
* position of settings dropdown in grid view ([a90fe7d](https://github.com/newrelic/nr1-slo-r/commit/a90fe7daa07bb9effac1eaea575064658aeeb05e))
* remove unused nerdletStateContext ([a4a3804](https://github.com/newrelic/nr1-slo-r/commit/a4a3804280a2509c78a1fd4ee70e9c2177527847))
* rename stylesheet to match import [skip ci] ([e565135](https://github.com/newrelic/nr1-slo-r/commit/e565135737eb163c2336b11be64dc5a419ae8705))
* **SLO table:** fix issue where table didn't show ([16ea137](https://github.com/newrelic/nr1-slo-r/commit/16ea137da8fdf8cfc8f272c1ee52bb47828d1494))
* setting a default for slo_document types without defects ([8109887](https://github.com/newrelic/nr1-slo-r/commit/81098872c91c1205eed91f10e7cbb0d1a730494a))
* simplify and store whole defects object (Issue [#41](https://github.com/newrelic/nr1-slo-r/issues/41)) ([72c5c84](https://github.com/newrelic/nr1-slo-r/commit/72c5c8444298dba98ecfaf82f69bbd039a586cf4))
* SLO titles shouldn't be set in all caps ([f2b2f06](https://github.com/newrelic/nr1-slo-r/commit/f2b2f062902f183ad05dd3e60c758ec430be65ab))
* style text inputs properly ([16e8257](https://github.com/newrelic/nr1-slo-r/commit/16e825790c1f6f1befb3412294024ece00578d85))
* table data scope variables ([14dea6f](https://github.com/newrelic/nr1-slo-r/commit/14dea6fbf1f6fbc3ed4908141284c4451e6b48a2))
* update buggy looping and appending (WIP) ([318b65c](https://github.com/newrelic/nr1-slo-r/commit/318b65c5c9024eb5a67737502329afb5b1eaeecb))
* update/fix format when incrementally adding to list of slo docs ([e22d58a](https://github.com/newrelic/nr1-slo-r/commit/e22d58aebe86a67d0d48e25ea5d1bb37043b7619))


### Features

* [WIP] Adding bootstrap table ([d320e23](https://github.com/newrelic/nr1-slo-r/commit/d320e23c7f932e3830085b1d655e1d183bb1c124))
* add constants ([3ec4653](https://github.com/newrelic/nr1-slo-r/commit/3ec4653ac568a2840d91a6bb5847e80d3a213ffc))
* add description field and display in view details (Issue [#36](https://github.com/newrelic/nr1-slo-r/issues/36)) ([4c0e5b3](https://github.com/newrelic/nr1-slo-r/commit/4c0e5b35b7df0c63368c7c33f3cc7d5ae65af6fd))
* add description to grid view ([4531a63](https://github.com/newrelic/nr1-slo-r/commit/4531a636b4ce42d00928a70899ae72ce62ef352c)), closes [#36](https://github.com/newrelic/nr1-slo-r/issues/36)
* add docs link to edit modal ([2c8b406](https://github.com/newrelic/nr1-slo-r/commit/2c8b406f15e40dfa8fd8255980aa98702775d26b)), closes [#38](https://github.com/newrelic/nr1-slo-r/issues/38)
* add docs links into empty state ([3f76791](https://github.com/newrelic/nr1-slo-r/commit/3f767912990d0562448748e4d99f073f1fdf8814)), closes [#38](https://github.com/newrelic/nr1-slo-r/issues/38)
* add fetchDocumentById method for viewing/editing single docs ([9424fc4](https://github.com/newrelic/nr1-slo-r/commit/9424fc468fa3e481db199d79ad3314f9fd79f0a9))
* add grid view for SLO data ([d762e05](https://github.com/newrelic/nr1-slo-r/commit/d762e050b0451e50221a78380536e920f3c46932))
* add in alert dropdown in define slo form ([add22ee](https://github.com/newrelic/nr1-slo-r/commit/add22eec33e05d36fbae3d96046a6118628a560e))
* add in grid/table toggle switch ([55ab190](https://github.com/newrelic/nr1-slo-r/commit/55ab1904a01d53f9154fc8f7ddc37c1bc71e939d))
* add in toolbar to house CTA and toggle ([d8546a6](https://github.com/newrelic/nr1-slo-r/commit/d8546a619a9891501bf79b998d86e9276a9526b7))
* add launcher icon & bump version ([0faeb63](https://github.com/newrelic/nr1-slo-r/commit/0faeb635a3bb0001ab9066927e67d023630854eb))
* add modal wrapper component for wrapping forms ([2c022e7](https://github.com/newrelic/nr1-slo-r/commit/2c022e777515ec2ac74a79f4fd75c6ab5d416430))
* add nerdpack-layout-standard ([19ee1f0](https://github.com/newrelic/nr1-slo-r/commit/19ee1f0cca0dda3e6d4b0f94841d82b2f248c00d))
* add NRDS styles ([d48558b](https://github.com/newrelic/nr1-slo-r/commit/d48558b526fc735716e0c301f30ebd8117c57e3a))
* add react-bootstrap-table-next and style to match current table ([0f4bc85](https://github.com/newrelic/nr1-slo-r/commit/0f4bc85a238e8fc4c04870f3abb7d3ac51ef6ac9))
* add refreshing of slo documents (Issue [#42](https://github.com/newrelic/nr1-slo-r/issues/42)) ([fd7ee45](https://github.com/newrelic/nr1-slo-r/commit/fd7ee45c6724a0b757ee34ff58feb052cc30fb0e))
* add settings menu to encapsulate actions on cards ([5c4e309](https://github.com/newrelic/nr1-slo-r/commit/5c4e309db3e37113858fc8b0c0661d1579c34b87))
* add SLO description to table view ([77a73f3](https://github.com/newrelic/nr1-slo-r/commit/77a73f3785533634dd197aab958b0afe4cba1579)), closes [#36](https://github.com/newrelic/nr1-slo-r/issues/36)
* add transaction options to form ([8d15574](https://github.com/newrelic/nr1-slo-r/commit/8d15574e1b2fc292ba7844ad681573108658da00))
* add uuid for documents ([420c0a4](https://github.com/newrelic/nr1-slo-r/commit/420c0a4bef102aed4a1ed8710e91bf7509f95cc1))
* add value -> label mapping for slo indicators ([ce2c3d5](https://github.com/newrelic/nr1-slo-r/commit/ce2c3d5f75d58c2ad79ec72768a5b46febe3711f))
* adding circleci build files ([22c616a](https://github.com/newrelic/nr1-slo-r/commit/22c616add011d6ff4e1f31b37d33a97d734a58ff))
* adding update modal and populating form from a specific document ([53c5015](https://github.com/newrelic/nr1-slo-r/commit/53c50155aff020db1d061d16f2b187da8b3929b8))
* change team to organization Issue [#27](https://github.com/newrelic/nr1-slo-r/issues/27) ([dbb23de](https://github.com/newrelic/nr1-slo-r/commit/dbb23de9ea65764a4b5774f758700026f2a657d4))
* configure delete button in grid view ([defe5d9](https://github.com/newrelic/nr1-slo-r/commit/defe5d938d1a58ee910209e1cc0cff6ead3a6be5))
* display multiple nrql statements with a header ([23cfb19](https://github.com/newrelic/nr1-slo-r/commit/23cfb19db763c79c2630e2cc3fde3421c12e24db))
* drive transactions and alerts by time-picker (Issue [#5](https://github.com/newrelic/nr1-slo-r/issues/5)) ([3b71cf2](https://github.com/newrelic/nr1-slo-r/commit/3b71cf22a5e1b2297d51ac19de6432434a83192b))
* enable view, edit, delete from table ([80c05f2](https://github.com/newrelic/nr1-slo-r/commit/80c05f293902d47926794bcb36e61a304d56fdb9)), closes [#43](https://github.com/newrelic/nr1-slo-r/issues/43)
* highlight scopes that haven't met attainment goals ([f92dd57](https://github.com/newrelic/nr1-slo-r/commit/f92dd57a75fd3464cbb9352c4bab4c567e0ba33d))
* implement search for SLO table ([f4659ff](https://github.com/newrelic/nr1-slo-r/commit/f4659ff6521e1794d33f43c2f001574b537ab849)), closes [#32](https://github.com/newrelic/nr1-slo-r/issues/32)
* move collection name to constants ([357b7dd](https://github.com/newrelic/nr1-slo-r/commit/357b7dd9e6a93b7dda234fbd4e1baec641a3d67b))
* poc for [#26](https://github.com/newrelic/nr1-slo-r/issues/26) ([50ff7dc](https://github.com/newrelic/nr1-slo-r/commit/50ff7dcd11adc6981a253971200470bb97daa052))
* properly style view toggle switch ([26f836d](https://github.com/newrelic/nr1-slo-r/commit/26f836df97286d02ffb41fa4656b33ffcaa34609))
* store new SLO data in state ([8fda524](https://github.com/newrelic/nr1-slo-r/commit/8fda5244056f9c2e62307a2996677752c4cdf054))
* style add new SLO modal ([6f79c9a](https://github.com/newrelic/nr1-slo-r/commit/6f79c9a431e2cb4a35a18c22a6aee4b45e9f1b5b))
* style current if meeting attainment target (Issue [#34](https://github.com/newrelic/nr1-slo-r/issues/34)) ([6f0e94a](https://github.com/newrelic/nr1-slo-r/commit/6f0e94a8bf9445010d2699ff3e459851afb5b9ee))
* styles "view details" modal ([e68d62a](https://github.com/newrelic/nr1-slo-r/commit/e68d62afe7920eb6e32017832649e45644430905)), closes [#31](https://github.com/newrelic/nr1-slo-r/issues/31)
* styling for the new SLO table ([bf5c2c5](https://github.com/newrelic/nr1-slo-r/commit/bf5c2c5d54b87a5400e0255b33269c19a5d79f63))
* swaps out html table for TableChart component ([aa21111](https://github.com/newrelic/nr1-slo-r/commit/aa211111b4dc187dae17bafdf71223401c534dd2))
* Update design of "no SLO" empty state ([0718e80](https://github.com/newrelic/nr1-slo-r/commit/0718e80cf66c6954d9ffac01ec7ad611966550ff))
* **new SLO:** styles mutliselect dropdown ([9b694d6](https://github.com/newrelic/nr1-slo-r/commit/9b694d66a120cb2da4f7830aaffb1ee34acb244a))
* **new SLO form:** more styling for multi-select ([25630ef](https://github.com/newrelic/nr1-slo-r/commit/25630efff955072604aa74ec57f950eb14ff3a36))

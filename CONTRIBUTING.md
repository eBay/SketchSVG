# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email (pcanella at ebay dot com), or any other method with the owners of this repository before making a change. 

## System Requirements

This section includes information on system requirements, running the local server, tests and package scripts.

### System Requirements

* [Node.js](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/en/)

Clone this repo to your local environment then run `yarn` to install all dependencies.

To run this with your changes in your directory, please execute this:

`node index.js /path/to/sketchfile`

As an example, please feel free to use our sample `.sketch` files:

`node index.js /samples/multitest.sketch`


## Issues

If you see an issue, please don't hesitate to raise it as such! This tool is by no means perfect and any bugs found are appreciated. 

When an issue is filed, please use the following template:

```
<!-- Delete any sections below that are not relevant. -->

# Bug Report

## Sketch Version:

## Description

## Workaround?

## Screenshots
```

We'll try to be quick about responding to issues and PRs, so expect a response in a few days.

## Pull Request Process

### Before You Start

**Please make sure to send a PR to the `DEV` branch and not the `MASTER` branch!**

If you are significantly altering an existing file, please ensure that an issue has been created *before* you start any work, and that it has been assigned to you. The same goes for any big new additions or changes to the project structure, CI or documentation.

We want to avoid cases where two developers duplicate work.

The contents of a pull request should be related to a single issue only (or, at most, perhaps two very closely related issues). The reviewer has the right to reject a pull request that contains anything non-issue related.

1. Ensure any install or build dependencies are removed before the end of the layer when doing a 
   build.
2. Update the README.md with details of changes to the interface, this includes new environment 
   variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this
   Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you 
   do not have permission to do that, you may request the second reviewer to merge it for you.


### Avoiding Conflicts

It is your responsibility to ensure that your feature branch has no merge conflicts with it's base branch. A pull request created and sent for review containing many conflicts does not inspire confidence in the reviewer.

The best way to ensure there are no conflicts is by keeping your branch up to date with it's base branch and resolving any conflicts in your own branch early & often. You may do this either by rebasing or merging. If you are the only developer working in the feature branch (you need to be sure), it is usually better to rebase. If another developer is sharing your branch, then merging is the safer option (as it doesn't require a force push).

### Testing

Pretty simple here: if you add any sort of functionality, make sure you have tests to accompany them. We use Mocha, Chai and Sinon for our testing framework. Not sure how to test or see coverage? We have built in some functions to help with that:

`yarn test`  - runs all unit tests
`yarn coverage` - runs all unit tests & generates a command line version of coverage numbers
`yarn coverreport` - After running `yarn coverage`, run this to get a UI browser interface of the coverage numbers. Coverage reports are located at `./coverage/index.html`

**Please make sure to not degrade unit test numbers if you submit a new PR or it will not be approved!**



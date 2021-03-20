# Contributing

- [Contributing](#contributing)
  - [How to contribute](#how-to-contribute)
  - [Getting code](#getting-code)
  - [Code reviews](#code-reviews)
  - [Code style](#code-style)

## How to contribute

First of all, thank you for your interest in CervaJäger!
When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method before making a change.

Please note we have a code of conduct, follow it in all your interactions with the project.

## Getting code

1 - Clone this repository

```bash
git clone https://github.com/arturfigueira/cervajager.git
cd cervajager
```

2 - Install all dependencies

```bash
npm install
```

3 - Build and run all tests

```bash
npm run test
```

## Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

Also stick to these basic rules:

- One change per PR: Pull-requests should be small and easy to read. Do not mix different subjects, fixes, features;
- Add unit tests to cover your changes;
- To save your time, run tests locally and guarantee that it builds;
- Remove unnecessary files; [`.gitignore`](.gitignore) is pretty complete, and will cover almost any unnecessary file type, but it's not bullet proof.

## Code style

- Coding style is fully defined in [`.eslintrc`](.eslintrc.json) and we automatically format our code with [Prettier](https://prettier.io).
- It's recommended to set-up Prettier into your editor.
- You should explicitly type all variables and return types. You'll get ESLint warnings if you don't so if you're not sure use them as guidelines, and feel free to ask us for help!

To run ESLint, use:

```bash
npm run lint
```

You can check your code (both JS & TS) type-checks by running:

```bash
npm run build-ts
```

import { promises as fs } from 'fs';
import path from 'path';
import { html } from 'js-beautify';
import userEvent from '@testing-library/user-event';
import timer from 'timer-promise';
import i18next from 'i18next';
import en from '../src/js/locales/en';
import app from '../src/js/application';

const htmlOptions = {
  preserve_newlines: false,
  unformatted: [],
};

const fixturesPath = path.join(__dirname, '__fixtures__');
const getTree = () => html(document.body.innerHTML, htmlOptions);

let elements;

beforeEach((done) => {
  i18next
    .init({
      lng: 'en',
      debug: false,
      resources: {
        en,
      },
    })
    .then(() => fs.readFile(path.join(fixturesPath, 'index.html')))
    .then((data) => {
      const initHTML = data.toString();
      document.documentElement.innerHTML = initHTML;
      app();
      elements = {
        url: document.querySelector('input[name="url"]'),
        form: document.querySelector('.rss-form'),
      };
      done();
    });
});

test('init and wrong url', () => {
  expect(getTree()).toMatchSnapshot();
  return Promise
    .resolve()
    .then(() => userEvent.type(elements.url, 'wrong url', { allAtOnce: true }))
    .then(() => {
      elements.url.setAttribute('value', 'wrong url');
      return timer.start(10);
    })
    .then(() => expect(getTree()).toMatchSnapshot());
});

test('valid url', () => Promise
  .resolve()
  .then(() => userEvent.type(elements.url, 'https://vc.ru/rss', { allAtOnce: true }))
  .then(() => {
    elements.url.setAttribute('value', 'https://vc.ru/rss');
    return timer.start(10);
  })
  .then(() => expect(getTree()).toMatchSnapshot()));

test('required url', () => Promise
  .resolve()
  .then(() => userEvent.type(elements.url, '', { allAtOnce: true }))
  .then(() => {
    elements.url.setAttribute('value', '');
    return timer.start(10);
  })
  .then(() => expect(getTree()).toMatchSnapshot()));

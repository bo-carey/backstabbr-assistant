import { browser } from 'webextension-polyfill-ts';
import { v4 as uuid } from 'uuid';
import {
  EventType,
  EventMessage,
  Mutation,
  SiteSettings,
  EventMessageReturnType,
} from '../utils/constants';
import storage from '../utils/storage';
import testData from '../utils/testData';

let allTextNodes: Element[] = [];

const getTextNodes = (el: Element = document.body): Element[] => {
  const textNodes = [];
  const treeWalker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let node = treeWalker.nextNode();
  while (node) {
    textNodes.push(node as Element);
    node = treeWalker.nextNode();
  }
  return textNodes;
};

const regexReplace = ({
  query, replaceString, isCaseSensitive,
}: Mutation) => {
  const casedQuery = isCaseSensitive ? query : query.toLowerCase();
  for (let i = 0; i < allTextNodes.length; i++) {
    const node = allTextNodes[i];
    const currentValue = node.textContent || null;
    let newValue = currentValue;
    newValue = newValue?.replace(casedQuery, replaceString) || null;
    if (currentValue && newValue && currentValue !== newValue) {
      node.textContent = newValue;
    }
  }
};

const textReplace = ({
  query, replaceString, isCaseSensitive,
}: Mutation) => {
  const regexQuery = new RegExp(query, `g${!isCaseSensitive && 'i'}`);

  for (let i = 0; i < allTextNodes.length; i++) {
    const node = allTextNodes[i];
    const currentValue = node.textContent || null;
    const newValue = node.textContent?.replace(regexQuery, replaceString) || null;
    if (currentValue && newValue && currentValue !== newValue) {
      node.textContent = newValue;
    }
  }
};

const replaceText = (mutations: Mutation[]) => {
  mutations.forEach((pair) => {
    if (pair.isUsingRegex) {
      regexReplace(pair);
    } else {
      textReplace(pair);
    }
  });
};

const saveRules = async (settings: SiteSettings): Promise<void> => {
  const siteSettings = await storage.getSiteSettings();
  await storage.setSiteSettings({
    ...siteSettings,
    ...settings,
    uuid: siteSettings?.uuid || uuid(),
  });
};

const handleMessage = (message: EventMessage): Promise<EventMessageReturnType> | void => {
  console.log('message', message);
  switch (message.type) {
    case EventType.POPUP_MOUNTED:
      return storage.getSiteSettings();
    case EventType.REPLACE:
      return replaceText(message.payload as Mutation[]);
    case EventType.SAVE:
      return saveRules(message.payload as SiteSettings);
    default:
      console.log('AutoReplace recieved unknown message: ', message);
  }
  return Promise.resolve();
};

browser.runtime.onMessage.addListener(handleMessage);

allTextNodes = getTextNodes();

const createMockData = async (): Promise<void> => {
  testData.forEach((data) => storage.setSiteSettings(data));
};

createMockData();

const runReplacer = async () => {
  const siteSettings = await storage.getSiteSettings();
  replaceText(siteSettings?.rules || []);
};

window.addEventListener('onload', () => runReplacer());

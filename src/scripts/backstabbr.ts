import users from './users';
// import Countries from './countries';
import { cleanText, waitForElementToExist } from './utilities';

/**
 * Looks through the page to see if user data is available in
 * the info table. If it is, parses user information from
 * the info table and saves it in the browser storage sync.
 */
const gatherData = (): Promise<void> | void => {
  const tableRows = document.querySelectorAll('table > tbody > tr') as NodeList;
  if (!tableRows) return;
  let [gameRow, userRow]: HTMLElement[] = [];
  Array.from(tableRows).forEach((el: Node) => {
    const header = (el as HTMLElement).querySelector('th') as HTMLElement;
    if (header && header.textContent === 'Players') userRow = el as HTMLElement;
    if (header && header.textContent === 'Game Name') gameRow = el as HTMLElement;
  });
  if (!gameRow || !userRow) return;
  const gameRowNode = (gameRow as HTMLElement).querySelector('td') as HTMLElement;
  const gameName = gameRowNode.textContent as string;
  const userListNodes = (userRow as HTMLElement).querySelector('td ul') as HTMLElement;
  const userData = [];
  for (const li of Array.from(userListNodes.children)) {
    const anchor = li.children[0] as HTMLAnchorElement;
    const id = cleanText(anchor.textContent as string);
    userData.push({
      id,
      name: id.replace(/#\d+/, ''),
      url: anchor.href,
      country: cleanText(li.lastChild ? (li.lastChild.textContent as string) : ''),
    });
  }
  return users.set(gameName, userData);
};

const displayData = (gameName: string) => {
  waitForElementToExist('.playerlist').then(async (playerCountry) => {
    const userList = await users.get(gameName);
    if (!userList) return;
    const countryList = document.getElementsByClassName('country') as HTMLCollection;
    if (!countryList.length) return;
    Array.from(countryList).forEach((country) => {
      const newDiv = document.createElement('div');
      const nameSpan = document.createTextNode('Name');
      newDiv.appendChild(nameSpan);
      country.insertAdjacentElement('afterend', newDiv);
    });
  });
};

export function runBackstabbrAssistant(): void {
  const infoDiv = document.getElementById('info') as HTMLDivElement;
  if (infoDiv != null) {
    waitForElementToExist('table > tbody > tr')
      .then((element) => gatherData())
      .catch((err) => console.error(err));
  }
}
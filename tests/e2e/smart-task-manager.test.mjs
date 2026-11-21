import assert from 'node:assert/strict';
import { Builder, By, Key, until } from 'selenium-webdriver';

const baseUrl = process.env.APP_URL || 'http://localhost:5173';
const driver = await new Builder().forBrowser('chrome').build();
try {
  await driver.manage().window().setRect({ width: 1360, height: 950 });
  await driver.get(baseUrl);
  await driver.executeScript("localStorage.removeItem('smart-task-manager.tasks')");
  await driver.navigate().refresh();
  const addButton = By.css('.add-task');
  await driver.wait(until.elementLocated(addButton), 10000);
  await driver.findElement(addButton).click();
  const form = By.css('form[aria-label="Add task form"]');
  await driver.wait(until.elementLocated(form), 3000);
  await driver.findElement(By.css('input[name="name"]')).sendKeys('Selenium sample task');
  await driver.findElement(By.css('textarea[name="description"]')).sendKeys('Created by the browser test.');
  await driver.findElement(By.css('input[name="deadline"]')).sendKeys('2026-12-10');
  await driver.findElement(By.css('button[type="submit"]')).click();
  const task = By.css('[data-task-id]');
  await driver.wait(until.elementLocated(task), 3000);
  assert.match(await driver.findElement(By.css('body')).getText(), /Selenium sample task/);

  await driver.findElement(By.css('[aria-label="Search tasks"]')).sendKeys('Selenium sample');
  assert.match(await driver.findElement(By.css('.task-list-section')).getText(), /Selenium sample task/);
  const searchInput = await driver.findElement(By.css('[aria-label="Search tasks"]'));
  await searchInput.click();
  await searchInput.sendKeys(Key.CONTROL, 'a', Key.BACK_SPACE);
  await driver.wait(async () => (await searchInput.getAttribute('value')) === '' && (await driver.findElement(By.css('body')).getText()).includes('Review lecture notes'), 3000);

  await driver.findElement(By.css('[aria-label="Edit Selenium sample task"]')).click();
  const editForm = By.css('form[aria-label="Edit task form"]');
  const editFormElement = await driver.findElement(editForm);
  await driver.findElement(By.css('input[name="name"]')).clear();
  await driver.findElement(By.css('input[name="name"]')).sendKeys('Edited browser task');
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.stalenessOf(editFormElement), 3000);
  await driver.wait(until.elementLocated(By.css('[aria-label="Edit Edited browser task"]')), 3000);

  await driver.findElement(By.css('[aria-label="Mark Edited browser task complete"]')).click();
  await driver.findElement(By.css('input[type="checkbox"]')).click();
  assert.match(await driver.findElement(By.css('.task-list-section')).getText(), /Edited browser task/);

  const editedTaskDeleteButton = await driver.findElement(By.css('[aria-label="Delete Edited browser task"]'));
  await editedTaskDeleteButton.click();
  await driver.wait(until.alertIsPresent(), 3000);
  await (await driver.switchTo().alert()).accept();
  await driver.wait(until.stalenessOf(editedTaskDeleteButton), 3000);
  console.log('Selenium workflow passed: add, search, edit, complete, delete.');
} finally {
  await driver.quit();
}

import { test, expect } from "@playwright/test";

test("User can add, move, and delete task", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await page.fill('input[placeholder="Enter new task..."]', "Test Task");
  await page.click('button:has-text("Add Task")');

  const task = page.locator('text=Test Task');
  await expect(task).toBeVisible();

  const inProgressColumn = page.locator('div:has-text("⚡ In Progress")');
  await task.dragTo(inProgressColumn);

  await expect(inProgressColumn.locator('text=Test Task')).toBeVisible();

  const deleteButton = inProgressColumn.locator('text=Test Task >> button');
  await deleteButton.click();
  await expect(inProgressColumn.locator('text=Test Task')).toHaveCount(0);
});

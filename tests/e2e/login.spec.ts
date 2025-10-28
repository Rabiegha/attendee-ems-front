import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should login successfully and navigate to dashboard', async ({
    page,
  }) => {
    await page.goto('/')

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('h2')).toContainText('Connexion')

    // Fill login form
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('h1')).toContainText('Tableau de bord')

    // Should show user info in header
    await expect(page.locator('text=Admin User')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Identifiants invalides')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')

    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // Click logout
    await page.click('text=Déconnexion')

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/)
  })
})

import { Page, Locator, expect } from '@playwright/test';

// Define types for better type safety
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskCardStatus = 'À faire' | 'En cours' | 'Terminé';
export type TaskFilter = 'Toutes' | 'À faire' | 'En cours' | 'Terminé';

export class TaskManagerPage {
    private readonly page: Page;

    // Header Elements
    private readonly headerTitle: Locator;
    private readonly headerSubtitle: Locator;

    // Task Count Metrics
    private readonly todoCountSpan: Locator;
    private readonly inProgressCountSpan: Locator;
    private readonly doneCountSpan: Locator;
    private readonly totalCountSpan: Locator;
    private readonly refreshButton: Locator;

    // New Task Form Elements
    private readonly newTaskFormTitle: Locator;
    private readonly newTaskFormDescription: Locator;
    private readonly newTaskFormStatus: Locator;
    private readonly createTaskButton: Locator;

    // Task List Filters & Search
    private readonly allTasksFilterButton: Locator;
    private readonly todoFilterButton: Locator;
    private readonly inProgressFilterButton: Locator;
    private readonly doneFilterButton: Locator;
    private readonly searchInput: Locator;
    private readonly totalTasksDisplayedText: Locator;

    // Task Cards container
    private readonly taskCardsContainer: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize Locators
        // Header
        this.headerTitle = page.getByRole('heading', { name: '📋 TaskManager' });
        this.headerSubtitle = page.getByText('Projet fil rouge — Pipeline DevOps M1');

        // Task Count Metrics
        this.todoCountSpan = page.locator('(//div/span[ text() = "À faire"]//preceding-sibling::span[1])[1]');

        this.inProgressCountSpan = page.locator('(//div/span[ text() = "En cours"]//preceding-sibling::span[1])[1]')
        //this.inProgressCountSpan = page.locator('div:has-text("En cours")').first().locator('span').first();
        //this.doneCountSpan = page.locator('div:has-text("Terminé")').first().locator('span').first();
        this.doneCountSpan = page.locator('(//div/span[ text() = "Terminé"]//preceding-sibling::span[1])[1]')

        //this.totalCountSpan = page.locator('div:has-text("Total")').first().locator('span').first();
        this.totalCountSpan = page.locator('(//div/span[ text() = "Total"]//preceding-sibling::span[1])[1]')
        this.refreshButton = page.getByRole('button', { name: 'Actualiser' });

        // New Task Form
        this.newTaskFormTitle = page.locator('#f-title');
        this.newTaskFormDescription = page.locator('#f-desc');
        this.newTaskFormStatus = page.locator('#f-status');
        this.createTaskButton = page.getByRole('button', { name: 'Créer la tâche', exact: true });

        // Task List Filters & Search
        this.allTasksFilterButton = page.getByRole('button', { name: 'Toutes' });
        this.todoFilterButton = page.getByRole('button', { name: '🔵 À faire' });
        this.inProgressFilterButton = page.getByRole('button', { name: '🟡 En cours' });
        this.doneFilterButton = page.getByRole('button', { name: '🟢 Terminé' });
        this.searchInput = page.getByPlaceholder('🔍 Rechercher...');
        this.totalTasksDisplayedText = page.locator('p').filter({ hasText: /tâche/i });

        // Task Cards
        this.taskCardsContainer = page.locator('div').filter({ has: page.locator('article') });
    }

    // --- Utility & Navigation ---
    async navigate(url: string) {
        await this.page.goto(url);
    }

    async refreshPage() {
        await this.refreshButton.click();
        await this.page.waitForLoadState('domcontentloaded'); // Ensure page reloads completely
    }

    // --- Actions: New Task Form ---
    async fillNewTaskTitle(title: string) {
        await this.newTaskFormTitle.fill(title);
    }

    async fillNewTaskDescription(description: string) {
        await this.newTaskFormDescription.fill(description);
    }

    async selectNewTaskStatus(status: TaskStatus) {
        await this.newTaskFormStatus.selectOption(status);
    }

    async submitNewTask() {
        await this.createTaskButton.click();
    }

    /**
     * Creates a new task with given details.
     * @param title The title of the task.
     * @param description Optional description.
     * @param status Optional status ('TODO', 'IN_PROGRESS', 'DONE'), defaults to 'TODO'.
     */
    async createTask(title: string, description: string = '', status: TaskStatus = 'TODO') {
        await this.fillNewTaskTitle(title);
        if (description) {
            await this.fillNewTaskDescription(description);
        }
        await this.selectNewTaskStatus(status);
        await this.submitNewTask();
    }

    // --- Actions: Task Filters ---
    async filterTasksBy(filter: TaskFilter) {
        switch (filter) {
            case 'Toutes':
                await this.allTasksFilterButton.click();
                break;
            case 'À faire':
                await this.todoFilterButton.click();
                break;
            case 'En cours':
                await this.inProgressFilterButton.click();
                break;
            case 'Terminé':
                await this.doneFilterButton.click();
                break;
            default:
                throw new Error(`Unknown filter: ${filter}`);
        }
    }

    async searchForTask(query: string) {
        await this.searchInput.fill(query);
        // Assuming search is debounced or happens on input, no explicit submit needed from HTML
    }

    // --- Actions: Task Card Interactions ---

    /**
     * Returns a Locator for a specific task card based on its title.
     * @param taskTitle The title of the task.
     * @returns Locator for the task card.
     */
    getTaskCardLocator(taskTitle: string): Locator {
        return this.page.locator('article').filter({ hasText: taskTitle });
    }

    async clickEditTask(taskTitle: string) {
        const taskCard = this.getTaskCardLocator(taskTitle);
        await taskCard.getByRole('button', { name: '✏️' }).click();
    }

    async clickDeleteTask(taskTitle: string) {
        const taskCard = this.getTaskCardLocator(taskTitle);
        await taskCard.getByRole('button', { name: '🗑' }).click();
    }

    // --- Verifications ---

    async expectHeaderToBeVisible() {
        await expect(this.headerTitle).toBeVisible();
        await expect(this.headerSubtitle).toBeVisible();
    }

    async expectTodoCount(expectedCount: number) {
        await expect(this.todoCountSpan).toHaveText(String(expectedCount));
    }

    async expectInProgressCount(expectedCount: number) {
        await expect(this.inProgressCountSpan).toHaveText(String(expectedCount));
    }

    async expectDoneCount(expectedCount: number) {
        await expect(this.doneCountSpan).toHaveText(String(expectedCount));
    }

    async expectTotalCount(expectedCount: number) {
        await expect(this.totalCountSpan).toHaveText(String(expectedCount));
    }

    async expectDisplayedTaskCount(expectedCount: number) {
        await expect(this.totalTasksDisplayedText).toHaveText(`${expectedCount} tâche${expectedCount > 1 ? 's' : ''}`);
    }

    /**
     * Verifies if a specific task card is visible with its title, description, and status.
     * @param title The title of the task.
     * @param description The expected description.
     * @param status The expected status ('À faire', 'En cours', 'Terminé').
     */
    async expectTaskCardVisible(title: string, description: string, status: TaskCardStatus) {
        const taskCard = this.getTaskCardLocator(title);
        await expect(taskCard).toBeVisible();
        await expect(taskCard.getByRole('heading', { name: title })).toBeVisible();
        await expect(taskCard.locator('p').filter({ hasText: description })).toBeVisible();
        await expect(taskCard.locator('span').filter({ hasText: status }).first()).toBeVisible();
    }

    async expectTaskCardNotVisible(title: string) {
        const taskCard = this.getTaskCardLocator(title);
        await expect(taskCard).not.toBeVisible();
    }

    /**
     * Verifies the status of a specific task card.
     * @param taskTitle The title of the task.
     * @param expectedStatus The expected status ('À faire', 'En cours', 'Terminé').
     */
    async expectTaskCardStatus(taskTitle: string, expectedStatus: TaskCardStatus) {
        const taskCard = this.getTaskCardLocator(taskTitle);
        await expect(taskCard.locator('span').filter({ hasText: expectedStatus }).first()).toBeVisible();
    }

    async expectNewTaskFormToBeClear() {
        await expect(this.newTaskFormTitle).toHaveValue('');
        await expect(this.newTaskFormDescription).toHaveValue('');
        await expect(this.newTaskFormStatus).toHaveValue('TODO'); // Default value
    }

    async expectSearchInputToBeClear() {
        await expect(this.searchInput).toHaveValue('');
    }
}
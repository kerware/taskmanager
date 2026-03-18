import { Page, Locator, expect } from '@playwright/test';

// Define types for better type safety
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
type TaskCardStatus = 'À faire' | 'En cours' | 'Terminé';
type TaskFilter = 'Toutes' | 'À faire' | 'En cours' | 'Terminé';

export class TaskManagerPage2 {
    private readonly page: Page;

    // Referentiel de composant
    private readonly titleTask : Locator;
    private readonly descriptionTask : Locator;
    private readonly statusTask : Locator;
    private readonly createTaskButton : Locator;

    constructor(page: Page) {
        this.page = page;
        this.titleTask = this.page.getByRole('textbox', { name: 'Titre *' });
        this.descriptionTask = this.page.getByRole('textbox', { name: 'Description' });
        this.statusTask = this.page.getByLabel('Statut');
        this.createTaskButton = this.page.getByRole('button', { name: 'Créer la tâche' });
    }

    async createTask(title: string, description: string = '', status: TaskStatus = 'TODO') {
        await this.titleTask.fill( title );
        await this.descriptionTask.fill( description);
        await this.statusTask.selectOption( status );
        await this.createTaskButton.click();
    }
}

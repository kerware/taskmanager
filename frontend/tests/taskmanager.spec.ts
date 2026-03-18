import { test } from '@playwright/test';
import { TaskManagerPage } from './pages/TaskManagerPage'; // Assurez-vous que le chemin est correct

test.describe('Task Manager Application', () => {

    let taskManagerPage;

    test.beforeEach(async ({page}) => {
        taskManagerPage = new TaskManagerPage(page);
        // Hypothetically, navigate to your application's URL
        await taskManagerPage.navigate('http://localhost:3000'); // Remplacez par l'URL réelle de votre application
    });

    test('should display the header and task counts correctly', async () => {
        await taskManagerPage.expectHeaderToBeVisible();
        await taskManagerPage.expectTodoCount(3);
        await taskManagerPage.expectInProgressCount(1);
        await taskManagerPage.expectDoneCount(1);
        await taskManagerPage.expectTotalCount(5);
        await taskManagerPage.expectDisplayedTaskCount(5);
    });

    test('should create a task and verify its visibility as a card', async () => {
        await taskManagerPage.createTask( "TEST01" , "Desciption TEST01","TODO" )
        await taskManagerPage.expectTaskCardStatus( "TEST01" , "À faire")

    });




});

const BASE_URL = "http://localhost:3000";

describe("/ - Todos feed", () => {
    it("when load, renders the page", () => {
        //Trailing Slash
        cy.visit(BASE_URL);
    });
    it.only("when create a new todo, it must appears in the screen", () => {
        // 0 - Interceptações;Interceptação
        cy.intercept("POST", `${BASE_URL}/api/todos`, (request) => {
            request.reply({
                statusCode: 201,
                body: {
                    todo: {
                        id: "70905d7e-c969-45b1-99f0-1aa155477204",
                        date: "2023-04-15T19:46:51.109Z",
                        content: "Test todo",
                        done: false,
                    },
                },
            });
        }).as("createTodo");

        // 1 - Abrir a pagina
        cy.visit(BASE_URL);
        // 2 - Selecionar o input de criar nova todo
        const $inputAddTodo = cy.get("input[name='add-todo']");
        // 3 - Digiar no input de criar nova todo
        $inputAddTodo.type("Test todo");
        // 4 - Clicar no botão
        const $btnAddTodo = cy.get("[aria-label='Adicionar novo item']");
        $btnAddTodo.click();

        cy.get("table > tbody").contains("Test todo");
    });
});

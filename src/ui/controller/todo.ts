import { todoRepository } from "@ui/repository/todo";

interface TodoControllerGetParams {
    page: number;
}

async function get(params: TodoControllerGetParams) {
    return todoRepository.get({
        // Fazer a lógica de pegar os dados
        page: params.page,
        limit: 3,
    });
}

function filterTodosByContent<Todo>(
    search: string,
    todos: Array<Todo & { content: string }>
): Array<Todo> {
    const homeTodo = todos.filter((todo) => {
        const searchNormalized = search.toLowerCase();
        const contentNormalized = todo.content.toLowerCase();
        return contentNormalized.includes(searchNormalized);
    });

    return homeTodo;
}

export const todoController = {
    get,
    filterTodosByContent,
};

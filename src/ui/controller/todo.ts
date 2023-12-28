import { todoRepository } from "@ui/repository/todo";
import { Todo } from "@ui/schema/todo";
import { z as schema } from "zod";

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

interface TodoControllerCreateParams {
    content?: string;
    onSuccess: (todo: Todo) => void;
    onError: () => void;
}

function create({ content, onSuccess, onError }: TodoControllerCreateParams) {
    const parsedParams = schema.string().nonempty().safeParse(content);

    if (!parsedParams.success) {
        onError();
        return;
    }

    todoRepository
        .createdByContent(parsedParams.data)
        .then((newTodo) => {
            onSuccess(newTodo);
        })
        .catch(() => {
            onError();
        });
}

interface TodoControllerToggleDoneParams {
    id: string;
    updateTodoOnScreen: () => void;
    onError: () => void;
}

function toggleDone({
    id,
    updateTodoOnScreen,
    onError,
}: TodoControllerToggleDoneParams) {
    todoRepository
        .toggleDone(id)
        .then(() => {
            updateTodoOnScreen();
        })
        .catch(() => {
            onError();
        });
}

export const todoController = {
    get,
    filterTodosByContent,
    create,
    toggleDone,
};

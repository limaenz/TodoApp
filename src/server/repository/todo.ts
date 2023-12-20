interface TodoRepositoryGetParams {
    page?: number;
    limit?: number;
}

interface TodoRepositoryGetOutput {
    todos: Todo[];
    total: number;
    pages: number;
}

function get({
    page,
    limit,
}: TodoRepositoryGetParams = {}): TodoRepositoryGetOutput {
    const currentPage = page || 1;
    const currentLimit = limit || 10;

    const todos: Todo[] = [
        { id: "1", content: "Primeira TODO", date: new Date(), done: false },
        { id: "2", content: "Segunda TODO", date: new Date(), done: false },
        { id: "3", content: "Terceira TODO", date: new Date(), done: false },
        { id: "4", content: "Quarto Teste", date: new Date(), done: false },
        { id: "5", content: "Quinto Teste", date: new Date(), done: false },
        { id: "6", content: "Sexto teste", date: new Date(), done: false },
    ];

    const ALL_TODOS = todos;
    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = currentPage * currentLimit;
    const paginatedTodos = ALL_TODOS.slice(startIndex, endIndex);
    const totalPages = Math.ceil(ALL_TODOS.length / currentLimit);

    return {
        total: ALL_TODOS.length,
        todos: paginatedTodos,
        pages: totalPages,
    };
}

export const todoRepository = {
    get,
};

interface Todo {
    id: string;
    content: string;
    date: Date;
    done: boolean;
}

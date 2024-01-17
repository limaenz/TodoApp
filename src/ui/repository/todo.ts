import { Todo, TodoSchema } from "@ui/schema/todo";
import { z as schema } from "zod";

interface TodoRepositoryGetParams {
    page: number;
    limit: number;
}

interface TodoRepositoryGetOutput {
    todos: Todo[];
    total: number;
    pages: number;
}

async function get({
    page,
    limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
    const response = await fetch(`/api/todos?page=${page}&limit=${limit}`, {
        method: "GET",
    });

    if (response.ok) {
        const serverResponse = await response.json();

        const ServerResponseSchema = schema.object({
            total: schema.number(),
            pages: schema.number(),
            todos: TodoSchema.array(),
        });

        const serverResponseParsed =
            ServerResponseSchema.safeParse(serverResponse);

        if (!serverResponseParsed.success) {
            throw new Error("Failed to get TODO");
        }

        return {
            todos: serverResponseParsed.data.todos,
            total: serverResponseParsed.data.total,
            pages: serverResponseParsed.data.pages,
        };
    }

    throw new Error("Server Error");
}

export async function createdByContent(content: string): Promise<Todo> {
    const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content,
        }),
    });

    if (response.ok) {
        const serverResponse = await response.json();

        const ServerResponseSchema = schema.object({
            todo: TodoSchema,
        });

        const serverResponseParsed =
            ServerResponseSchema.safeParse(serverResponse);

        if (!serverResponseParsed.success) {
            throw new Error("Failed to create TODO");
        }

        const todo = serverResponseParsed.data.todo;
        return todo;
    }

    throw new Error("Server Error");
}

async function toggleDone(todoId: string): Promise<Todo> {
    const response = await fetch(`/api/todos/${todoId}/toggle-done`, {
        method: "PUT",
    });

    if (response.ok) {
        const serverResponse = await response.json();

        const ServerResponseSchema = schema.object({
            todo: TodoSchema,
        });

        const serverResponseParsed =
            ServerResponseSchema.safeParse(serverResponse);

        if (!serverResponseParsed.success) {
            throw new Error(`Failed to update TODO with ${todoId}`);
        }

        const todo = serverResponseParsed.data.todo;
        return todo;
    }

    throw new Error("Server Error");
}

async function deleteById(id: string) {
    const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete");
    }
}

export const todoRepository = {
    get,
    createdByContent,
    toggleDone,
    deleteById,
};

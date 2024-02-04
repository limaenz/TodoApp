import { todoRepository } from "@server/repository/todo";
import { z as schema } from "zod";
import { HttpNotFoundError } from "@server/infra/errors";
import { NextRequest } from "next/server";

async function get(request: NextRequest) {
    const QuerySchema = schema.object({
        page: schema.number(),
        limit: schema.number(),
    });
    const searchParams = request.nextUrl.searchParams;

    const query = {
        page: Number(searchParams.get("page")),
        limit: Number(searchParams.get("limit")),
    };

    const parsedQuery = QuerySchema.safeParse(query);

    if (!parsedQuery.success) {
        return new Response(
            JSON.stringify({
                error: {
                    message: "You must to provide a valid page or limit",
                },
            }),
            { status: 400 }
        );
    }

    try {
        const page = parsedQuery.data.page;
        const limit = parsedQuery.data.limit;

        const output = await todoRepository.get({ page, limit });
        return new Response(
            JSON.stringify({
                total: output.total,
                pages: output.pages,
                todos: output.todos,
            }),
            { status: 200 }
        );
    } catch (err) {
        if (err instanceof Error) {
            return new Response(
                JSON.stringify({
                    error: {
                        message: err.message,
                    },
                }),
                { status: 400 }
            );
        }
        return new Response(
            JSON.stringify({
                error: {
                    message: `Internal server error`,
                },
            }),
            { status: 500 }
        );
    }
}

const TodoCreateBodySchema = schema.object({
    content: schema.string(),
});

async function create(request: Request) {
    // Fail fast validations
    const res = await request.json();
    const body = TodoCreateBodySchema.safeParse(res);

    // Type Narrowing
    if (!body.success) {
        return new Response(
            JSON.stringify({
                error: {
                    message: "You need to provide a content to create a TODO",
                    description: body.error.issues,
                },
            }),
            { status: 400 }
        );
    }

    try {
        const createdTodo = await todoRepository.createdByContent(
            body.data.content
        );

        return new Response(
            JSON.stringify({
                todo: createdTodo,
            }),
            { status: 201 }
        );
    } catch (err) {
        if (err instanceof Error) {
            return new Response(
                JSON.stringify({
                    error: {
                        message: err.message,
                    },
                }),
                { status: 400 }
            );
        }

        return new Response(
            JSON.stringify({
                error: {
                    message: `Internal server error`,
                },
            }),
            { status: 500 }
        );
    }
}

async function toggleDone(request: Request, params: { id: string }) {
    const QuerySchema = schema.object({
        id: schema.string().uuid().nonempty(),
    });

    const parsedQuery = QuerySchema.safeParse(params);

    if (!parsedQuery.success) {
        return new Response(
            JSON.stringify({
                error: {
                    message: "You must to provide a string ID",
                },
            }),
            { status: 400 }
        );
    }

    try {
        const todoId = parsedQuery.data.id;
        const updateTodo = await todoRepository.toggleDone(todoId);

        return new Response(
            JSON.stringify({
                todo: updateTodo,
            }),
            { status: 200 }
        );
    } catch (err) {
        if (err instanceof Error) {
            return new Response(
                JSON.stringify({
                    error: {
                        message: err.message,
                    },
                }),
                { status: 400 }
            );
        }
    }

    return new Response(
        JSON.stringify({
            error: {
                message: `Internal server error`,
            },
        }),
        { status: 500 }
    );
}

async function deleteById(request: Request, params: { id: string }) {
    const QuerySchema = schema.object({
        id: schema.string().uuid().nonempty(),
    });

    const parsedQuery = QuerySchema.safeParse(params);

    if (!parsedQuery.success) {
        return new Response(
            JSON.stringify({
                error: {
                    message: `You must to provide a valid id`,
                },
            }),
            { status: 400 }
        );
    }

    try {
        const todoId = parsedQuery.data.id;
        await todoRepository.deleteById(todoId);
        return new Response(null, { status: 204 });
    } catch (err) {
        if (err instanceof HttpNotFoundError) {
            return new Response(
                JSON.stringify({
                    error: {
                        message: err.message,
                    },
                }),
                { status: err.status }
            );
        }
    }

    return new Response(
        JSON.stringify({
            error: {
                message: `Internal server error`,
            },
        }),
        { status: 500 }
    );
}

export const todoController = {
    get,
    create,
    toggleDone,
    deleteById,
};

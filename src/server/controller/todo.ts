import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";
import { HttpNotFoundError } from "@server/infra/errors";

async function get(req: NextApiRequest, res: NextApiResponse) {
    const QuerySchema = schema.object({
        page: schema.number(),
        limit: schema.number(),
    });

    const query = {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
    };

    const parsedQuery = QuerySchema.safeParse(query);

    if (!parsedQuery.success) {
        res.status(400).json({
            error: {
                message: `You must to provide a valid page or limit`,
            },
        });
        return;
    }

    try {
        const page = parsedQuery.data.page;
        const limit = parsedQuery.data.limit;

        const output = await todoRepository.get({ page, limit });

        res.status(200).json({
            total: output.total,
            pages: output.pages,
            todos: output.todos,
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({
                error: {
                    message: err.message,
                },
            });
        }

        res.status(500).json({
            error: {
                message: `Internal server error`,
            },
        });
    }
}

const TodoCreateBodySchema = schema.object({
    content: schema.string(),
});

async function create(req: NextApiRequest, res: NextApiResponse) {
    // Fail fast validations
    const body = TodoCreateBodySchema.safeParse(req.body);

    // Type Narrowing
    if (!body.success) {
        res.status(400).json({
            error: {
                message: "You need to provide a content to create a TODO",
                description: body.error.issues,
            },
        });
        return;
    }
    try {
        const createdTodo = await todoRepository.createdByContent(
            req.body.content
        );

        res.status(201).json({
            todo: createdTodo,
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({
                error: {
                    message: err.message,
                },
            });
        }

        res.status(500).json({
            error: {
                message: `Internal server error`,
            },
        });
    }
}

async function toggleDone(req: NextApiRequest, res: NextApiResponse) {
    const QuerySchema = schema.object({
        id: schema.string(),
    });

    const parsedQuery = QuerySchema.safeParse(req.query.id);

    if (!parsedQuery.success) {
        res.status(400).json({
            error: {
                message: "You must to provide a string ID",
            },
        });
        return;
    }

    try {
        const updateTodo = await todoRepository.toggleDone(parsedQuery.data.id);

        res.status(200).json({
            todo: updateTodo,
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({
                error: {
                    message: err.message,
                },
            });
        }

        res.status(500).json({
            error: {
                message: `Internal server error`,
            },
        });
    }
}

async function deleteById(req: NextApiRequest, res: NextApiResponse) {
    const QuerySchema = schema.object({
        id: schema.string().uuid().nonempty(),
    });

    const parsedQuery = QuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
        res.status(400).json({
            error: {
                message: `You must to provide a valid id`,
            },
        });
        return;
    }

    try {
        const todoId = parsedQuery.data.id;
        await todoRepository.deleteById(todoId);
        res.status(204).end();
    } catch (err) {
        if (err instanceof HttpNotFoundError) {
            return res.status(err.status).json({
                error: {
                    message: err.message,
                },
            });
        }

        res.status(500).json({
            error: {
                message: `Internal server error`,
            },
        });
    }
}

export const todoController = {
    get,
    create,
    toggleDone,
    deleteById,
};

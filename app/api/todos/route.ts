import { todoController } from "@server/controller/todo";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    return await todoController.get(request);
}

export async function POST(request: Request) {
    return await todoController.create(request);
}

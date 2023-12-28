import React from "react";
import { GlobalStyles } from "@ui/theme/GlobalStyles";
import { todoController } from "@ui/controller/todo";

const bg = "/bg.jpg"; // inside public folder

interface HomeTodo {
    id: string;
    content: string;
    done: boolean;
}

function HomePage() {
    const initialLoadComplete = React.useRef(false);
    const [totalPages, setTotalPages] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const [IsLoading, setIsLoading] = React.useState(true);
    const [todos, setTodos] = React.useState<HomeTodo[]>([]);
    const [newTodoContent, setNewTodoContent] = React.useState("");

    const homeTodos = todoController.filterTodosByContent(search, todos);

    const hasMorePages = totalPages > page;
    const hasNoTodos = homeTodos.length == 0 && !IsLoading;

    // Load infos onload - Quando o componente é carregado executa função
    React.useEffect(() => {
        if (!initialLoadComplete.current) {
            todoController
                .get({ page })
                .then(({ todos, pages }) => {
                    setTodos(todos);
                    setTotalPages(pages);
                    initialLoadComplete.current = true;
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    return (
        <main>
            <GlobalStyles themeName="coolGrey" />
            <header
                style={{
                    backgroundImage: `url('${bg}')`,
                }}
            >
                <div className="typewriter">
                    <h1>O que fazer hoje?</h1>
                </div>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        todoController.create({
                            content: newTodoContent,
                            onSuccess(todo: HomeTodo) {
                                setTodos((oldTodos) => {
                                    return [todo, ...oldTodos];
                                });
                                setNewTodoContent("");
                            },
                            onError() {
                                alert(
                                    "Você precisa ter um conteúdo para criar uma TODO!"
                                );
                            },
                        });
                    }}
                >
                    <input
                        type="text"
                        placeholder="Correr, Estudar..."
                        value={newTodoContent}
                        onChange={function newTodoHandler(event) {
                            setNewTodoContent(event.target.value);
                        }}
                    />
                    <button type="submit" aria-label="Adicionar novo item">
                        +
                    </button>
                </form>
            </header>

            <section>
                <form>
                    <input
                        type="text"
                        placeholder="Filtrar lista atual, ex: Dentista"
                        onChange={function handlerSearch(event) {
                            setSearch(event.target.value);
                        }}
                    />
                </form>

                <table border={1}>
                    <thead>
                        <tr>
                            <th align="left">
                                <input type="checkbox" disabled />
                            </th>
                            <th align="left">Id</th>
                            <th align="left">Conteúdo</th>
                            <th />
                        </tr>
                    </thead>

                    <tbody>
                        {homeTodos.map((todo) => {
                            return (
                                <tr key={todo.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={todo.done}
                                            onChange={function handleToggle() {
                                                todoController.toggleDone({
                                                    id: todo.id,
                                                    updateTodoOnScreen() {
                                                        setTodos(
                                                            (currentTodos) => {
                                                                return currentTodos.map(
                                                                    (
                                                                        currentTodo
                                                                    ) => {
                                                                        if (
                                                                            currentTodo.id ===
                                                                            todo.id
                                                                        ) {
                                                                            return {
                                                                                ...currentTodo,
                                                                                done: !currentTodo.done,
                                                                            };
                                                                        }
                                                                        return currentTodo;
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    },
                                                    onError() {
                                                        alert(
                                                            "Falha ao atualizar a TODO"
                                                        );
                                                    },
                                                });
                                            }}
                                        />
                                    </td>
                                    <td>{todo.id.substring(0, 4)}</td>
                                    <td>
                                        {!todo.done && todo.content}
                                        {todo.done && <s>{todo.content}</s>}
                                    </td>
                                    <td align="right">
                                        <button data-type="delete">
                                            Apagar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {IsLoading && (
                            <tr>
                                <td
                                    colSpan={4}
                                    align="center"
                                    style={{ textAlign: "center" }}
                                >
                                    Carregando...
                                </td>
                            </tr>
                        )}

                        {hasNoTodos && (
                            <tr>
                                <td colSpan={4} align="center">
                                    Nenhum item encontrado
                                </td>
                            </tr>
                        )}

                        {hasMorePages && !hasNoTodos && (
                            <tr>
                                <td
                                    colSpan={4}
                                    align="center"
                                    style={{ textAlign: "center" }}
                                >
                                    <button
                                        data-type="load-more"
                                        onClick={() => {
                                            setIsLoading(true);
                                            const nextPage = page + 1;
                                            setPage(nextPage);

                                            todoController
                                                .get({ page: nextPage })
                                                .then(({ todos, pages }) => {
                                                    setTodos((oldTodos) => {
                                                        return [
                                                            ...oldTodos,
                                                            ...todos,
                                                        ];
                                                    });
                                                    setTotalPages(pages);
                                                })
                                                .finally(() => {
                                                    setIsLoading(false);
                                                });
                                        }}
                                    >
                                        Página {page} Carregar mais{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                marginLeft: "4px",
                                                fontSize: "1.2em",
                                            }}
                                        >
                                            ↓
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </main>
    );
}

export default HomePage;

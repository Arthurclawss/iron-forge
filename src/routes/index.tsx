import { createFileRoute } from "@tanstack/react-router";
import IronForgeLanding from "@/components/iron-forge/IronForgeLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iron Forge — Forjando Físicos Extraordinários" },
      {
        name: "description",
        content:
          "A academia mais premium do Brasil. Treinos personalizados, equipamentos de última geração e resultados comprovados.",
      },
      { property: "og:title", content: "Iron Forge — Forjando Físicos Extraordinários" },
      {
        property: "og:description",
        content: "Junte-se a mais de 2.400 atletas que transformaram seus corpos na Iron Forge.",
      },
    ],
  }),
  component: IronForgeLanding,
});

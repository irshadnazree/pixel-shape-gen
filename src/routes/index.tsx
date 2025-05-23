import { createFileRoute } from "@tanstack/react-router";
import PixelShapeGenerator from "../components/PixelShapeGenerator";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <PixelShapeGenerator />;
}

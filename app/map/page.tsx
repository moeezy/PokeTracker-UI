import { Route } from "@/app/lib/definitions";
import { getRoutes } from "@/app/lib/api";

export default async function Page() {
  const routes: Route[] = await getRoutes();
  return (
    <ul>
      {routes.map((route) => (
        <li key={route.routeId}>{route.routeName}</li>
      ))}
    </ul>
  )
}
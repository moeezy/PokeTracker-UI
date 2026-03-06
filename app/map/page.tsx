// async function getRoutes(){
//     const res = await fetch('http://localhost:8080/v1/Routes')

// }

interface Route {
  routeId: string | number; // Use appropriate types (e.g., string or number)
  routeName: string;
}

export default async function Page() {
  const res = await fetch('http://localhost:8080/v1/Routes')
  const routes: Route[] = await res.json()
  return (
    <ul>
      {routes.map((route) => (
        <li key={route.routeId}>{route.routeName}</li>
      ))}
    </ul>
  )
}
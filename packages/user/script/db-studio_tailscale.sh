sudo tailscale up --accept-routes --accept-dns --stateful-filtering

npx dotenv -e ../../.env.dev -- drizzle-kit studio

sudo tailscale down


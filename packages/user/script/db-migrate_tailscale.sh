sudo tailscale up --accept-routes --accept-dns --stateful-filtering

# Create, first time only
#npx dotenv -e ../../.env.dev -- createdbjs tuba-user --host=postgres-rw.dev.tuba --port=5432 --user=root --password=''

npx dotenv -e ../../.env.dev -- drizzle-kit push

sudo tailscale down